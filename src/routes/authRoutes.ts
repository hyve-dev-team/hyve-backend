import { Router } from "express";
import {
  startOnboarding,
  verifyEmail,
  setPassword,
  uploadAvatar,
  getProfile,
  login,
} from "../controllers/authController";
import { upload } from "../middleware/uploadMiddleware";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/start", startOnboarding);
router.post("/verify-otp", verifyEmail);
router.post("/set-password", setPassword);
router.post("/upload-avatar", upload.single("avatar"), uploadAvatar);
router.post("/login", login);
router.get("/profile", authenticateToken, getProfile);

export default router;
