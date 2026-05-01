import { isValidObjectId } from "mongoose";
import {
  deleteCloudinary,
  uploadOnCloudinary,
} from "../config/cloudinary.config";
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
  // for nested object sefly parseing
  const parseJsonData = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
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
const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  // check vendor update his won products
  if (product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this product");
  }
  // ------parse string to object -----
  const parseJsonData = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (error) {
      return undefined;
    }
  };
  const fieldsToUpdate = {
    ...req.body,
    shipping: parseJsonData(req.body.shipping),
    seo: parseJsonData(req.body.seo),
    specifications: parseJsonData(req.body.specifications),
    variants: parseJsonData(req.body.variants),
  };
  // ==== object.assign use to impose all data in products data====
  Object.assign(product, fieldsToUpdate);
  // image modeling
  if (req.files.mainImage || req.files.gallery?.length > 0) {
    if (req.files?.mainImage?.[0]) {
      const oldMainImage = product.images.find((img) => img.isMain === true);
      if (oldMainImage?.publicId) {
        await deleteCloudinary(oldMainImage.publicId);
      }
    }
    await addImageToQueue({
      productId: product._id,
      operation: "UPDATE",
      mainImagePath: req.files.mainImage[0].path || null,
      galleryPaths: req.files.gallery.map((f) => f.path) || [],
      keepOldGallery: req.body.keepOldGallery === "true",
    });
  }
  const updatedProduct = await product.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProduct,
        "Product updated. Slug and Price recalculated. Images are being processed."
      )
    );
});
const softDelete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productRepository.softDelete(id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { name: product.name },
        "Product deleted (archived) successfully"
      )
    );
});
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productRepository.advancedSearch(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});
const getVendorProducts = asyncHandler(async (req, res) => {
  const filters = {
    ...req.query,
    vendor: req.user?._id,
    isActive: true,
    status: req.query.status || "active",
  };
  const result = await productRepository.advancedSearch(filters);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Vendor products fetched successfully"));
});
const getProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }
  const data = await productRepository.getProductDetails(productId);
  if (!data || !data.product) {
    throw new ApiError(404, "Product not found");
  }
  await data.product.incrementViews();

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Product details fetched successfully"));
});

export { createProduct, updateProduct };
