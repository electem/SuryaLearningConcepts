const router = require("express").Router();
const { otpStatusWebhook } = require("../controllers/webhookController");

router.post("/otp-status", otpStatusWebhook);

module.exports = router;