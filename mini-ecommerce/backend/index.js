import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cartRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products",authMiddleware, productRoutes);
app.use("/api/orders",authMiddleware, orderRoutes);
app.use("/api/cart",authMiddleware, cartRoutes);
app.get('/health',(req,res)=>{
  res.send("server is running fine")
})

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.use("/api/auth", authRoutes);
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.log(err));
