import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { createCategory } from "../controller/category.controller";

const router = Router();
// src/routes/category.routes.js
router.route("/create").post(
  verifyJWT,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createCategory
);
export default router;
