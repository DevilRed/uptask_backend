import express from "express";
import { connectDB } from "./config/db";
import ProjectRoutes from "./routes/ProjectRoutes";

connectDB();
const app = express();
app.use(express.json());
app.use("/api/projects", ProjectRoutes);

export default app;
