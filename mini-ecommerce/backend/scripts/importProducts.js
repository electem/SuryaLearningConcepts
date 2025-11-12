import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const importProducts = async () => {
  try {
    const res = await axios.get("https://dummyjson.com/products?limit=100");
    const products = res.data.products.map(p => ({
      name: p.title,
      price: p.price,
      category: p.category,
      description: p.description,
      image: p.thumbnail
    }));

    await Product.deleteMany(); // optional: clear old products
    await Product.insertMany(products);

    console.log("Products imported successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importProducts();
