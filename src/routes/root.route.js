import { Router } from "express";
import authRoutes from "../routes/auth.routes";
const rootRouter = Router();
rootRouter.use("/auth", authRoutes);
rootRouter.use("/cart", cartRouter);
export default rootRouter;
