import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { stopFocusSession } from "../controllers/focusSessionController.js";

const router = Router();
router.use(protect);

router.patch("/:id/stop", stopFocusSession);

export default router;
