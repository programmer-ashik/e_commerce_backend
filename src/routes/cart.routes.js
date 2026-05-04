import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import {
  addToCart,
  applyCoupon,
  getCart,
  removeItem,
} from "../controller/cart.controller";

const router = Router();
router.use(verifyJWT);
router.route("/").get(getCart);
router.route("/add").post(addToCart);
router.route("/apply-coupon").post(applyCoupon);
router.route("/remove/:productId").delete(removeItem);
export default router;
