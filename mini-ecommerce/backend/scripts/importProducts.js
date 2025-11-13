import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

const importProducts = async () => {
  try {
    const res = await axios.get("https://dummyjson.com/products?limit=100");
    console.log("product length",res.data.products.length);
    const products = res.data.products.map((p) => ({
      name: p.title,
      price: p.price,
      category: p.category,
      description: p.description,
      image: p.thumbnail,
    }));

    // Clear old products
    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log("Products imported successfully");
    mongoose.connection.close(); // ✅ close connection properly
  } catch (err) {
    console.error("Error importing products:", err);
    mongoose.connection.close();
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await importProducts();
};

run();
