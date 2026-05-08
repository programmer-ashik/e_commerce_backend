import { Router } from "express";
import authRoutes from "../routes/auth.routes";
import userRoutes from "../routes/user.routes.js";
import cartRouter from "./routes/cart.routes.js";
const rootRouter = Router();
rootRouter.use("/auth", authRoutes);
rootRouter.use("/users", userRoutes);
// rootRouter.use("/cart", cartRouter);
export default rootRouter;
