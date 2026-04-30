import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  updateUserAvatar,
  userProfileUpdate,
} from "../controller/user.controller.js";
import { Router } from "express";

const router = Router();
router
  .route("/update-profile")
  .patch(verifyJWT, upload.single("avatar"), userProfileUpdate);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
