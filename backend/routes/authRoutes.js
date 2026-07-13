import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  signup, login, getMe, updateMe, forgotPassword, resetPassword,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

export default router;
