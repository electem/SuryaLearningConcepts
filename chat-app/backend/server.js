// server.js
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import authRoutes from "./routes/auth.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
import userRoutes from "./routes/users.js";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", cors(), express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.get("/health",(req,res)=>{
  res.send("server running")
})


const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only images allowed"));
    }
    cb(null, true);
  }
});

// Image upload route
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });

  res.json({
    success: true,
    url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
  });
});



const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const onlineUsers = new Map();

function sendJSON(ws, data) {
  if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
}

function broadcastToUsers(userIds, data) {
  for (const userId of userIds) {
    const conn = onlineUsers.get(String(userId));
    if (conn) sendJSON(conn, data);
  }
}

function parseTokenFromReq(req) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get("token");
  } catch {
    return null;
  }
}

wss.on("connection", async (ws, req) => {
  const token = parseTokenFromReq(req);
  if (!token) {
    sendJSON(ws, { type: "error", message: "No token provided" });
    ws.close();
    return;
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    sendJSON(ws, { type: "error", message: "Invalid token" });
    ws.close();
    return;
  }

  const userId = payload.id;
  const userDoc = await User.findById(userId);
  if (!userDoc) {
    sendJSON(ws, { type: "error", message: "User not found" });
    ws.close();
    return;
  }
  const username = userDoc.username;

  ws.userId = userId.toString();
  ws.username = username;
  onlineUsers.set(userId.toString(), ws);

  sendJSON(ws, { type: "connected", payload: { user: { id: ws.userId, username } } });

  const onlineList = Array.from(onlineUsers.values()).map((s) => ({
    id: s.userId,
    username: s.username,
  }));
  for (const [, s] of onlineUsers) sendJSON(s, { type: "online_users", payload: { users: onlineList } });

  ws.on("message", async (messageRaw) => {
    let msg;
    try {
      msg = JSON.parse(messageRaw.toString());
    } catch {
      return sendJSON(ws, { type: "error", message: "Bad JSON" });
    }

    const { type, payload } = msg;

    // ---------- Private Message ----------
    if (type === "private_message") {
     const { toUserId, content, image } = payload || {};
      if (!toUserId || !content) return;

      const saved = await Message.create({
        from: userId,
        toUser: toUserId,
        content,
        image, 
        status: "sent", // message status
      });

      const toUserDoc = await User.findById(toUserId);
      const toUsername = toUserDoc?.username || "Unknown";

      const out = {
        type: "private_message",
        payload: {
          messageId: saved._id.toString(),
          from: saved.from.toString(),
          fromUsername: username,
          toUserId: saved.toUser.toString(),
          toUsername,
          content: saved.content,
          image: saved.image || null, 
          status: saved.status,
          createdAt: saved.createdAt,
        },
      };

      sendJSON(ws, out);

           const recipientConn = onlineUsers.get(String(toUserId));
      if (recipientConn) {
        // notify recipient immediately
        sendJSON(recipientConn, out);

        // Mark message as delivered in DB and notify both parties
        await Message.findByIdAndUpdate(saved._id, { status: "delivered" });

        const deliveredEvent = {
          type: "message_status",
          payload: {
            messageId: saved._id.toString(),
            status: "delivered",
          },
        };

        // notify sender (ws) and recipient
        sendJSON(ws, deliveredEvent);
        sendJSON(recipientConn, deliveredEvent);
      } else {
        // recipient offline — sender only gets the original sent event
        // (status remains "sent" in DB)
      }

    }
        // ---------- Read Receipt ----------
    else if (type === "read_message") {
      const { messageId } = payload || {};
      if (!messageId) return;

      const msgDoc = await Message.findById(messageId);
      if (!msgDoc) return;

      // Only the receiver can mark a private message as read
      if (msgDoc.toUser && msgDoc.toUser.toString() !== userId) return;

      // Update status to 'read' if not already
      if (msgDoc.status !== "read") {
        msgDoc.status = "read";
        await msgDoc.save();

        const readEvent = {
          type: "message_status",
          payload: {
            messageId,
            status: "read",
          },
        };

        // notify both sender and receiver (if online)
        if (msgDoc.toUser) {
          broadcastToUsers([msgDoc.from.toString(), msgDoc.toUser.toString()], readEvent);
        } else {
          // room message read semantics could be added later.
          broadcastToUsers(Array.from(onlineUsers.keys()), readEvent);
        }
      }
    }


    // ---------- Edit Message ----------
    else if (type === "edit_message") {
      const { messageId, newContent } = payload;
      if (!messageId || !newContent) return;

      const msgDoc = await Message.findById(messageId);
      if (!msgDoc || msgDoc.from.toString() !== userId) return;

      // NEW - correct way
      msgDoc.content = newContent;
      msgDoc.edited = true; // mark message as edited
      await msgDoc.save();

      const update = {
        type: "message_edited",
        payload: {
          messageId,
          newContent,
          edited: true, // send flag to frontend
        },
      };

      // send to all involved users
      if (msgDoc.toUser)
        broadcastToUsers(
          [msgDoc.from.toString(), msgDoc.toUser.toString()],
          update
        );
      else broadcastToUsers(Array.from(onlineUsers.keys()), update);
    }

    // ---------- Delete Message ----------
    else if (type === "delete_message") {
      const { messageId } = payload;
      if (!messageId) return;

      const msgDoc = await Message.findById(messageId);
      if (!msgDoc || msgDoc.from.toString() !== userId) return;

      await Message.findByIdAndDelete(messageId);

      const del = {
        type: "message_deleted",
        payload: { messageId },
      };

      if (msgDoc.toUser) broadcastToUsers([msgDoc.from.toString(), msgDoc.toUser.toString()], del);
      else broadcastToUsers(Array.from(onlineUsers.keys()), del);
    }

    // ---------- Typing Indicator ----------
    else if (type === "typing") {
      const { toUserId, roomId, isTyping } = payload;
      const event = { type: "typing", payload: { from: userId, roomId, isTyping } };

      if (toUserId) {
        const recipientConn = onlineUsers.get(String(toUserId));
        if (recipientConn) sendJSON(recipientConn, event);
      } else if (roomId) {
        // broadcast to room members (except sender)
        for (const [, s] of onlineUsers) {
          if (s.userId !== userId) sendJSON(s, event);
        }
      }
    }

    // ---------- Room Message ----------
    else if (type === "room_message") {
      const { roomId, content, members } = payload || {};
      if (!roomId || !content) return;

      const saved = await Message.create({ from: userId, roomId, content, status: "sent" });

      const data = {
        type: "room_message",
        payload: {
          messageId: saved._id.toString(),
          from: saved.from.toString(),
          fromUsername: username,
          roomId,
          content: saved.content,
          status: saved.status,
          createdAt: saved.createdAt,
        },
      };

      if (Array.isArray(members) && members.length) broadcastToUsers(members, data);
      else for (const [, s] of onlineUsers) sendJSON(s, data);
    }

    // ---------- Fetch History ----------
    else if (type === "fetch_history") {
      const { mode, withUserId, roomId, limit = 50 } = payload || {};

      if (mode === "private" && withUserId) {
        const msgs = await Message.find({
          $or: [
            { from: userId, toUser: withUserId },
            { from: withUserId, toUser: userId },
          ],
        })
          .sort({ createdAt: 1 })
          .limit(limit);

        const history = await Promise.all(
          msgs.map(async (m) => {
            const sender = await User.findById(m.from);
            return {
              messageId: m._id.toString(),
              from: m.from.toString(),
              fromUsername: sender?.username || "Unknown",
              toUserId: m.toUser ? m.toUser.toString() : null,
              content: m.content,
              image: m.image || null,
              status: m.status,
              createdAt: m.createdAt,
            };
          })
        );

        sendJSON(ws, { type: "history_private", payload: { withUserId, messages: history } });
      }

      if (mode === "room" && roomId) {
        const msgs = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(limit);

        const history = await Promise.all(
          msgs.map(async (m) => {
            const sender = await User.findById(m.from);
            return {
              messageId: m._id.toString(),
              from: m.from.toString(),
              fromUsername: sender?.username || "Unknown",
              image: m.image || null,
              roomId: m.roomId,
              content: m.content,
              status: m.status || "sent",
              createdAt: m.createdAt,
            };
          })
        );

        sendJSON(ws, { type: "history_room", payload: { roomId, messages: history } });
      }
    }
  });

  ws.on("close", () => {
    onlineUsers.delete(userId.toString());
    const onlineList2 = Array.from(onlineUsers.values()).map((s) => ({ id: s.userId, username: s.username }));
    for (const [, s] of onlineUsers) sendJSON(s, { type: "online_users", payload: { users: onlineList2 } });
  });
});

// ---------------- Connect to Mongo ----------------
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const port = process.env.PORT || 4500;
    server.listen(port, () => console.log(`Server listening on ${port}`));
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
