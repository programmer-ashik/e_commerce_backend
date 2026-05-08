import { Router } from "express";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";

const rootRouter = Router();
rootRouter.use("/auth", authRoutes);
rootRouter.use("/users", userRoutes);
// rootRouter.use("/cart", cartRouter);
export default rootRouter;
