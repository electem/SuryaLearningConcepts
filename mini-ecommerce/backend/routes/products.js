import express from "express";
import Product from "../models/Product.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all products (user)
// GET /products?search=shirt&sort=price_asc&page=1&limit=9
router.get("/", async (req, res) => {
  try {
    let { search, sort, page, limit } = req.query;

    page = parseInt(page) || 1; // default page 1
    limit = parseInt(limit) || 9; // default 9 items per page
    const skip = (page - 1) * limit;

    // Search by name or description
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Sorting
    let sortQuery = {};
    if (sort === "price_asc") sortQuery.price = 1;
    else if (sort === "price_desc") sortQuery.price = -1;
    else if (sort === "name_asc") sortQuery.name = 1;
    else if (sort === "name_desc") sortQuery.name = -1;

    const total = await Product.countDocuments(searchQuery);
    const products = await Product.find(searchQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Owner: Add product
router.post("/", authMiddleware, roleMiddleware(["owner"]), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Owner: Update product
router.put("/:id", authMiddleware, roleMiddleware(["owner"]), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Owner: Delete product
router.delete("/:id", authMiddleware, roleMiddleware(["owner"]), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
