const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { client, serviceSid } = require("../config/twilio");

// 1. Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // 1. Create or update user → pending
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        isVerified: false,
        status: "pending"
      });
    } else {
      // do NOT reset verified user blindly
      if (!user.isVerified) {
        user.status = "pending";
        await user.save();
      }
    }

    // 2. Call Twilio
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phone,
        channel: "sms",
        statusCallback: "https://alberto-calceolate-stockily.ngrok-free.dev/api/webhook/otp-status"
      });

    // 3. Mark as sent
    await User.findOneAndUpdate(
      { phone },
      { status: "sent" }
    );

    res.json({
      success: true,
      message: "OTP sent",
      sid: verification.sid
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// 2. Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // 1. Verify OTP
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phone,
        code: otp,
      });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // 2. Find user
    let user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 3. Mark verified
    user.isVerified = true;
    user.status = "verified";
    await user.save();

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};