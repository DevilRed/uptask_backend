import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import ProjectRoutes from "./routes/ProjectRoutes";
import AuthRoutes from "./routes/authRoutes";

dotenv.config()
connectDB();
const app = express();
app.use(cors(corsConfig))
app.use(express.json());
app.use("/api/projects", ProjectRoutes);
app.use("/api/auth", AuthRoutes);

export default app;
