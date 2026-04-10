const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

// protected route
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected data accessed successfully",
    user: req.user
  });
});

module.exports = router;