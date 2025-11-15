// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // private messages
    roomId: { type: String }, // room messages
    content: { type: String, required: true },
    image: { type: String, default: null },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" }, // delivery status only
    edited: { type: Boolean, default: false }, // NEW: for edited messages
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
