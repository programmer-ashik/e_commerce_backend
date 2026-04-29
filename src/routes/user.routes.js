import { Route } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  updateUserAvatar,
  userProfileUpdate,
} from "../controller/user.controller.js";

const router = Route();
router
  .route("/update-profile")
  .patch(verifyJWT, upload.single("avatar"), userProfileUpdate);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
