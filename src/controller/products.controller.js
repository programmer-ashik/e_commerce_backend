import { uploadOnCloudinary } from "../config/cloudinary.config";
import { addImageToQueue } from "../queues/image.queue";
import { productRepository } from "../repositories/product.repository";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discount,
    stock,
    category,
    subcategory,
    brand,
    specifications,
    tags,
    shipping,
    seo,
    variants,
  } = req.body;
  if (!name || !price || !category) {
    throw new ApiError(400, "Name, Price, and Category are required");
  }
  //   ---image uploading logic--------

  //   -----image uploading complated----------
  // for nested object sefly parseing
  const parseJsonData = (data) => {
    try {
      return typeof data === "string" ? json.parse(data) : data;
    } catch (error) {
      return undefined;
    }
  };
  const shippingData = parseJsonData(req.body.shipping);
  const seoData = parseJsonData(req.body.seo);
  const variantsData = parseJsonData(req.body.variants);
  const specificationsData = parseJsonData(req.body.specifications);
  //------------tags processing----------
  let tagsData = [];
  if (req.body.tags) {
    tagsData =
      typeof req.body.tags === "string"
        ? req.body.tags.split(",").map((tag) => tag.trim())
        : req.body.tags;
  }
  const finalProductData = {
    name,
    price: Number(price),
    discount: Number(discount || 0),
    stock: Number(stock || 0),
    vendor: req.user._id,
    category,
    subcategory,
    brand,
    shipping: {
      weight: Number(shippingData?.weight || 0),
      dimensions: {
        length: Number(shippingData?.dimensions?.length || 0),
        width: Number(shippingData?.dimensions?.width || 0),
        height: Number(shippingData?.dimensions?.height || 0),
      },
      isFreeShipping:
        shippingData?.isFreeShipping === true ||
        shippingData?.isFreeShipping === "true",
      shippingCost: Number(shippingData?.shippingCost || 0),
      estimatedDelivery: shippingData?.estimatedDelivery || "",
    },

    seo: {
      title: seoData?.title || name,
      description: seoData?.description || "",
      keywords: Array.isArray(seoData?.keywords) ? seoData.keywords : [],
    },

    specifications: specificationsData || {},
    tags: tagsData,
    variants: Array.isArray(variantsData) ? variantsData : [],

    status: "pending",
  };
  const product = await productRepository.createProduct(finalProductData);
  await addImageToQueue({
    productId: product._id,
    mainImagePath: req.files.mainImage[0].path,
    galleryPaths: req.files.gallery.map((f) => f.path),
  });
  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        { productId: product._id },
        "Product images are being processed in background"
      )
    );
});
export { createProduct };
