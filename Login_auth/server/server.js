import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import { authMiddleware, isAdmin } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API Running...");
});


app.get("/api/user/dashboard", authMiddleware, (req, res) => {
  res.json({ msg: "Welcome User Dashboard" });
});

app.get("/api/admin/dashboard", authMiddleware, isAdmin, (req, res) => {
  res.json({ msg: "Welcome Admin Dashboard" });
});

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch(err => console.log(err));