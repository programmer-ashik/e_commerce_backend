import { Worker } from "bullmq";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";

const worker = new Worker(
  "image-upload",
  async (job) => {
    const {
      productId,
      operation,
      mainImagePath,
      galleryPaths,
      keepOldGallery,
    } = job.data;

    console.log(`Starting ${operation} for product: ${productId}`);

    let updatedImages = [];
    const product = await Product.findById(productId);
    if (!product) return;

    //==============main image processing============
    if (mainImagePath) {
      const mainImageUpload = await uploadOnCloudinary(mainImagePath);
      updatedImages.push({
        url: mainImageUpload.url,
        publicId: mainImageUpload.public_id,
        isMain: true,
      });
    } else {
      //if new image not come keep old images
      const oldMain = product.images.find((img) => img.isMain);
      if (oldMain) updatedImages.push(oldMain);
    }

    //================galary image processing==========
    if (galleryPaths && galleryPaths.length > 0) {
      const galleryUploads = await Promise.all(
        galleryPaths.map((path) => uploadOnCloudinary(path))
      );

      const newGallery = galleryUploads
        .filter((img) => img !== null)
        .map((img) => ({
          url: img.url,
          publicId: img.public_id,
          isMain: false,
        }));

      // ==============if old gallary want to keep ================
      if (keepOldGallery) {
        const oldGallery = product.images.filter((img) => !img.isMain);
        updatedImages = [...updatedImages, ...oldGallery, ...newGallery];
      } else {
        updatedImages = [...updatedImages, ...newGallery];
      }
    } else {
      // in new gallary not come keep old gallary
      const oldGallery = product.images.filter((img) => !img.isMain);
      updatedImages = [...updatedImages, ...oldGallery];
    }

    // ===========update database=========
    await Product.findByIdAndUpdate(productId, {
      images: updatedImages,
      // ========== send for review check===========
      status: "pending",
    });

    console.log(`Successfully finished ${operation} for product: ${productId}`);
  },
  { connection: { host: "localhost", port: 6379 } }
);
