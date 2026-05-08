import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  getUserProfile,
  updateUserAvatar,
  userProfileUpdate,
} from "../controller/user.controller.js";

const router = Router();

// Middleware
router.use(verifyJWT);

// Flat structure routes
router.get("/me", getUserProfile);
router.patch("/update-profile", userProfileUpdate);
router.patch("/update-avatar", upload.single("avatar"), updateUserAvatar);

export default router;
