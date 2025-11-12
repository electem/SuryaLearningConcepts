import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    { productId: String, name: String, price: Number, quantity: Number }
  ],
  total: Number,
  status: { type: String, default: "pending" },
  userInfo: { name: String, phone: String, address: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);
