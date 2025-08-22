import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import ProjectRoutes from "./routes/ProjectRoutes";

dotenv.config()
connectDB();
const app = express();
app.use(cors(corsConfig))
app.use(express.json());
app.use("/api/projects", ProjectRoutes);

export default app;
