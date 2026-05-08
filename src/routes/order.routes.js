import { Router } from "express";
import { authorizeRole, verifyJWT } from "../middleware/auth.middleware.js";
import {
  getOrderById,
  getOrderByOrderNum,
  getSalesReport,
  getUserOrders,
  placeNewOrder,
  updateOrderAndStatus,
} from "../controller/order.controller.js";

const router = Router();
router.route("/place-order").post(verifyJWT, placeNewOrder);
router.route("/my-orders").get(verifyJWT, getUserOrders);

router
  .route("/update-status/:orderId")
  .patch(
    verifyJWT,
    authorizeRole("super-admin", "admin", "vendor"),
    updateOrderAndStatus
  );

router.route("/order/:orderId").get(verifyJWT, getOrderById);
router.route("/track/:orderNumber").get(verifyJWT, getOrderByOrderNum);

router
  .route("/sales-report")
  .get(
    verifyJWT,
    authorizeRole("super-admin", "admin", "manager", "vendor"),
    getSalesReport
  );

export default router;
