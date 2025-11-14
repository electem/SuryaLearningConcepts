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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

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

  // fetch username from DB
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

  // Tell this socket it's connected
  sendJSON(ws, { type: "connected", payload: { user: { id: ws.userId, username } } });

  // Broadcast current online users to all
  const onlineList = Array.from(onlineUsers.values()).map((s) => ({
    id: s.userId,
    username: s.username,
  }));
  for (const [, s] of onlineUsers) {
    sendJSON(s, { type: "online_users", payload: { users: onlineList } });
  }

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
      const { toUserId, content } = payload || {};
      if (!toUserId || !content) return;

      // Save to DB (assumes Message schema has fields: from, toUser, content)
      const saved = await Message.create({ from: userId, toUser: toUserId, content });

      // fetch recipient username if available
      const toUserDoc = await User.findById(toUserId);
      const toUsername = toUserDoc?.username || "Unknown";

      // Build normalized payload to send to both sender and recipient
      const out = {
        type: "private_message",
        payload: {
          from: saved.from.toString(),
          fromUsername: username,
          toUserId: saved.toUser ? saved.toUser.toString() : String(toUserId),
          toUsername,
          content: saved.content,
          createdAt: saved.createdAt || new Date(),
          messageId: saved._id.toString(),
        },
      };

      // send to sender
      sendJSON(ws, out);

      // send to recipient if online
      const recipientConn = onlineUsers.get(String(toUserId));
      if (recipientConn) sendJSON(recipientConn, out);
    }

    // ---------- Join Room ----------
    else if (type === "join_room") {
      const { roomId } = payload || {};
      if (!roomId) return;

      sendJSON(ws, { type: "joined_room", payload: { roomId } });

      const notification = {
        type: "room_notification",
        payload: { roomId, message: `${username} joined the room`, createdAt: new Date() },
      };
      for (const [, s] of onlineUsers) sendJSON(s, notification);
    }

    // ---------- Room Message ----------
    else if (type === "room_message") {
      const { roomId, content, members } = payload || {};
      if (!roomId || !content) return;

      const saved = await Message.create({ from: userId, roomId, content });

      const data = {
        type: "room_message",
        payload: {
          from: saved.from.toString(),
          fromUsername: username,
          roomId,
          content: saved.content,
          createdAt: saved.createdAt || new Date(),
          messageId: saved._id.toString(),
        },
      };

      if (Array.isArray(members) && members.length) broadcastToUsers(members, data);
      else for (const [, s] of onlineUsers) sendJSON(s, data);
    }

    // ---------- Fetch History ----------
    else if (type === "fetch_history") {
      const { mode, withUserId, roomId, limit = 50 } = payload || {};

      if (mode === "private" && withUserId) {
        // find messages where either side is the current user and the other is withUserId
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
              roomId: m.roomId,
              content: m.content,
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

    const onlineList2 = Array.from(onlineUsers.values()).map((s) => ({
      id: s.userId,
      username: s.username,
    }));
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
