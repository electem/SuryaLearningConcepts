import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRouter from "./controllers/uploadController.js";
import queryRouter from "./controllers/queryController.js";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure /data + vector file exists
const dir = "./data";
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const vectorFile = process.env.VECTOR_FILE || "./data/vectors.json";
if (!fs.existsSync(vectorFile)) fs.writeFileSync(vectorFile, JSON.stringify([]));

app.use("/api/upload", uploadRouter);
app.use("/api/query", queryRouter);

app.get("/", (req, res) => res.send("PDF Chat backend running"));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
