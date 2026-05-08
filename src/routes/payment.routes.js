import { Route } from "express";

const router = Route();
router.route("/success").post(paymentSuccess);
router.route("/fail").post(paymentFailed);
routeer.route("cancel").post(paymentFailed);
export default router;
