import { Worker } from "bullmq";
import { uploadOnCloudinary } from "../config/cloudinary.config";
import { promise } from "zod";
import { Product } from "../models/productModel/Products.models";

const worker = new Worker(
  "image-upload",
  async (job) => {
    const { productId, mainImagePath, galleryPaths } = job.data;
    console.log(`Processing images for product:${productId}`);
    const mainImage = await uploadOnCloudinary(mainImagePath);
    const galleryUploads = await Promise.all(
      galleryPaths.map((path = uploadOnCloudinary(path)))
    );
    const productImages = [
      { url: mainImage.url, publicId: mainImage.public_id, isMain: true },
      ...galleryUploads.map((img) => ({
        url: img.url,
        publicId: img.public_id,
      })),
    ];
    //   database update
    await Product.findByIdAndUpdate(productId, {
      images: productImages,
      status: "pending",
    });
    console.log(`Job completed for product: ${productId}`);
  },
  { connection: { host: "localhost", port: 6379 } }
);
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
