import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // works for guest or logged-in user
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Cart", cartSchema);
