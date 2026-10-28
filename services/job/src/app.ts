import express from "express";
import cors from "cors";
import jobRoutes from "./routes/job.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/job", jobRoutes);

export default app;
