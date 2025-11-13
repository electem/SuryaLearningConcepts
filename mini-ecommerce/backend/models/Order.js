import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // keep your current relation
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  total: Number, // keep your current name
  currency: { type: String, default: "inr" }, // new field
  status: { type: String, enum: ["paid", "pending", "failed"], default: "pending" }, // updated enum
  paymentIntentId: String, // new field for Stripe reference
  userInfo: {
    name: String,
    phone: String,
    address: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
