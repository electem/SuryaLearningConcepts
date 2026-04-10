const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    unique: true,
    required: true
  },
   isVerified: {
    type: Boolean,
    default: false
  },
   status: {
    type: String,
    enum: ["pending", "sent", "verified"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);