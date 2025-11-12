import express from "express";
import Order from "../models/Order.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Place order (user)
router.post("/", authMiddleware, roleMiddleware(["user"]), async (req, res) => {
  try {
    const order = await Order.create({
      userId: req.user._id,
      items: req.body.items,
      total: req.body.total,
      userInfo: req.body.userInfo
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User: Get own orders
router.get("/", authMiddleware, roleMiddleware(["user"]), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Owner: Get all orders
router.get("/all", authMiddleware, roleMiddleware(["owner"]), async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "phone");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
