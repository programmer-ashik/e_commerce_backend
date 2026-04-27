import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import { tryCatch } from "bullmq";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(
      `\n monogdb connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDb connection error:", error);
  }
};
export default connectDb;
