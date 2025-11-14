import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // if you have auth

const router = express.Router();

// Get all users except yourself
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // exclude password
    res.json(users.filter(u => String(u._id) !== String(req.user.id)));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
