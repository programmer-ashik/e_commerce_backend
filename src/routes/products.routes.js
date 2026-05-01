import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createProductValidation } from "../validations/products.validation.js";
import { createProduct } from "../controller/products.controller.js";

const router = Router();
router.route("/create").post(
  verifyJWT,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  validate(createProductValidation),
  createProduct
);
// src/routes/product.routes.js
router.route("/details/:productId").get(getProductDetails);

export default router;
