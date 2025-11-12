import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Twilio from "twilio";
import dotenv from "dotenv";
import { authMiddleware } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

// ✅ Initialize Twilio client
const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * ✅ 1️⃣ Send OTP to phone number
 */
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  try {
    if (!phone) return res.status(400).json({ message: "Phone number required" });
    if (!phone.startsWith("+")) return res.status(400).json({ message: "Include country code e.g. +91..." });

    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    if (verification.status === "pending") {
      res.json({ message: "OTP sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (err) {
    console.error("Send OTP Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ 2️⃣ Verify OTP
 */
router.post("/verify-otp", async (req, res) => {
  const { phone, code } = req.body;

  try {
    if (!phone || !code)
      return res.status(400).json({ message: "Phone and code are required" });

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Create or find user
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, role: "user" }); // default role: user
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
      user,
    });
  } catch (err) {
    console.error("Verify OTP Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ 3️⃣ Get current user
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      phone: user.phone,
      role: user.role,
    });
  } catch (err) {
    console.error("Get Me Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
