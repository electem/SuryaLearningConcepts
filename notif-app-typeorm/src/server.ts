import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth";
import notifyRoutes from "./routes/notify";
import { startCron } from "./cron/jobs";
import { errorHandler } from "./middleware/errorHandler";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/notifications", notifyRoutes);
app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log("✅ MySQL connected via TypeORM");
    startCron();
    app.listen(process.env.PORT || 4000, () => console.log("Server running on port:4000"));
  })
  .catch((err) => console.error("DB init error:", err));
