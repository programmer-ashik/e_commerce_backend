import express from "express";
import cors from "cors";
import { corsSetting } from "./config/cors.config.js";
import cookieParser from "cookie-parser";
import rootRouter from "./routes/root.route.js";

const app = express();
//in middleware
app.use(corsSetting);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
// import all routers
app.use("/api/v1", rootRouter);
export { app };
