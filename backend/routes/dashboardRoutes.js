import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getTodaySummary, getHeatmap, getDayDetail, recalculateLifeScore,
  getCurrentLifeScore, getLifeScoreTrend,
} from "../controllers/dashboardController.js";

const router = Router();
router.use(protect);

router.get("/today", getTodaySummary);
router.get("/heatmap", getHeatmap);
router.get("/day", getDayDetail);
router.post("/life-score/recalculate", recalculateLifeScore);
router.get("/life-score/today", getCurrentLifeScore);
router.get("/life-score/trend", getLifeScoreTrend);

export default router;
