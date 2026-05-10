import { Router } from "express";
import { userRegisterSchema } from "../validations/user.validation.js";
import validate from "../middleware/validate.middleware.js";
import {
  changepassword,
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  register,
  resendOtp,
  resetPasswordConfrim,
  veryfyEmail,
} from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();
// public route
router.post("/register", validate(userRegisterSchema), register);
router.post("/verify-email", veryfyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
// if forget password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordConfrim);
// protected route
router.post("/change-password", verifyJWT, changepassword);
router.post("/logout", verifyJWT, logout);

export default router;
