import { Queue } from "bullmq";
import Redis from "ioredis";

const redisConnection = new Redis({
  host: "localhost",
  post: 6379,
});
const imageQueue = new Queue("image-upload", {
  connection: redisConnection,
});
const addImageToQueue = async (data) => {
  await imageQueue.add("process-images", data, {
    attempts: 3,
    backoff: 5000,
  });
};
export { imageQueue, addImageToQueue };
