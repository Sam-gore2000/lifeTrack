import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import focusSessionRoutes from "./routes/focusSessionRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// --- middleware ---
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// --- health check ---
app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// --- routes ---
app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/focus-sessions", focusSessionRoutes);

// --- errors ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`LifeOS API running on port ${PORT}`));
});

export default app;
