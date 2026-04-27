import { Router } from "express";
import { userRegisterSchema } from "../validations/user.validation.js";
import validate from "../middleware/validate.middleware.js";
import { register } from "../controller/auth.controller.js";

const router = Router();

// public route
router.post("/register", validate(userRegisterSchema), register);
// router.post("/login", login);
// router.post("/refresh-token", refreshAccessToken);

// protected route
// router.post("/logout", verifyJWT, logout);

export default router;
