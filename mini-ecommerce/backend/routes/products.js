import express from "express";
import Product from "../models/Product.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// ================================
// GET all products (user & owner)
// ================================
router.get("/", async (req, res) => {
  try {
    let { search, sort, page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 9;
    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

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

// ================================
// POST a new product (owner only)
// ================================
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["owner"]),
  upload.single("image"), // handle image upload
  async (req, res) => {
    try {
      const { name, price, category, description } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : "";

      const product = await Product.create({ name, price, category, description, image });
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ================================
// PUT /:id - update product (owner only)
// ================================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["owner"]),
  upload.single("image"), // allow updating image as well
  async (req, res) => {
    try {
      const { name, price, category, description } = req.body;
      const updateData = { name, price, category, description };

      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ================================
// DELETE /:id - delete product (owner only)
// ================================
router.delete("/:id", authMiddleware, roleMiddleware(["owner"]), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
