import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  createChallenge, getChallenges, getChallenge, setChallengeDayStatus,
  deleteChallenge, abandonChallenge,
} from "../controllers/challengeController.js";

const router = Router();
router.use(protect);

router.post("/", createChallenge);
router.get("/", getChallenges);
router.get("/:id", getChallenge);
router.post("/:id/log", setChallengeDayStatus);
router.patch("/:id/abandon", abandonChallenge);
router.delete("/:id", deleteChallenge);

export default router;
