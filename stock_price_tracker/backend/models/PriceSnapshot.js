import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  symbol: String,
  price: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("PriceSnapshot", priceSchema);
