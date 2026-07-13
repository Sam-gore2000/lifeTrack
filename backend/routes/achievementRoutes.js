import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getAllAchievements, checkAchievements } from "../controllers/achievementController.js";

const router = Router();
router.use(protect);

router.get("/", getAllAchievements);
router.post("/check", checkAchievements);

export default router;
