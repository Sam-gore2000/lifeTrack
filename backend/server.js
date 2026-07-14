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
import challengeRoutes from "./routes/challengeRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// --- middleware ---
// CLIENT_ORIGIN is a comma-separated list of exact origins, e.g.
//   https://life-track.vercel.app,https://life-track-git-main-yourteam.vercel.app
// Entries may also be a wildcard like *.vercel.app to match any preview URL
// on that domain (useful since Vercel gives every branch/PR its own URL).
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

function isOriginAllowed(origin) {
  return allowedOrigins.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1); // ".vercel.app"
      return origin.endsWith(suffix);
    }
    return origin === allowed;
  });
}

app.use(
  cors({
    origin(origin, callback) {
      // requests with no Origin header (curl, server-to-server, health checks)
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      console.warn(`CORS: blocked request from origin "${origin}". Allowed: ${allowedOrigins.join(", ")}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
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
app.use("/api/challenges", challengeRoutes);

// --- errors ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`LifeOS API running on port ${PORT}`));
});

export default app;
