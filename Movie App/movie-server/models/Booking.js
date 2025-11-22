const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    movieId: { type: String, required: true },
    movieTitle: { type: String, required: true },
    tickets: { type: Number, required: true },
    amount: { type: Number, required: true }, // store total paid
    paymentStatus: { type: String, default: "Pending" },
    stripeSessionId: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
