import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  createGoal, getGoals, getGoal, updateGoal, archiveGoal, deleteGoal,
} from "../controllers/goalController.js";
import {
  logProgress, incrementProgress, setGoalStatus, getTodayLogs, getLogsInRange,
} from "../controllers/dailyLogController.js";
import { startFocusSession, getFocusSessions } from "../controllers/focusSessionController.js";

const router = Router();
router.use(protect);

router.post("/", createGoal);
router.get("/", getGoals);
router.get("/logs/today", getTodayLogs);
router.get("/logs", getLogsInRange);
router.get("/focus-sessions", getFocusSessions);

router.get("/:id", getGoal);
router.patch("/:id", updateGoal);
router.patch("/:id/archive", archiveGoal);
router.delete("/:id", deleteGoal);

router.post("/:goalId/log", logProgress);
router.post("/:goalId/log/increment", incrementProgress);
router.post("/:goalId/status", setGoalStatus);
router.post("/:goalId/focus-sessions/start", startFocusSession);

export default router;
