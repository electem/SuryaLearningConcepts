import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/payments.js"; // 👈 new route for Stripe
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();

// ✅ Stripe requires raw body for webhook
import bodyParser from "body-parser";
app.use(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" })
);
app.use(express.json()); // other routes can use normal json

// Middleware
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);
// Mount webhook route FIRST (no auth)
app.use("/api/payments/webhook", bodyParser.raw({ type: "application/json" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount payments route (with auth only for checkout/session)
app.use("/api/payments", paymentRoutes);


// Health check
app.get("/health", (req, res) => {
  res.send("server is running fine");
});

const PORT = process.env.PORT || 5000;

// ✅ Connect DB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.log(err));
