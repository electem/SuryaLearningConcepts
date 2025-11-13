import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// 🛒 Get cart by userId (pass userId as query param or "guest")
router.get("/", async (req, res) => {  
  try {
    const userId = req.query.userId || "guest"; // fallback to guest
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { userId = "guest", productId, name, price, quantity } = req.body;

    if (!productId || !name || !price || !quantity)
      return res.status(400).json({ error: "Missing required fields" });

    // ✅ Find existing cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // ✅ Check if item already exists
    const existing = cart.items.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// 🗑️ Remove item from cart
router.delete("/remove/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.updatedAt = Date.now();
    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🧹 Clear entire cart
router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
