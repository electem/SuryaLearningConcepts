const User = require("../models/User");

exports.otpStatusWebhook = async (req, res) => {
  try {
    console.log("Webhook received:", req.body);

    const { To, VerificationStatus } = req.body;

    // Map Twilio status → your DB status
    let update = {};

    if (VerificationStatus === "pending") {
      update.status = "pending";
    }

    if (VerificationStatus === "approved") {
      update.status = "verified";
      update.isVerified = true;
    }

    if (
      VerificationStatus === "canceled" ||
      VerificationStatus === "failed"
    ) {
      update.status = "failed";
    }

    await User.findOneAndUpdate(
      { phone: To },
      update
    );

    res.sendStatus(200);

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};