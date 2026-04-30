import { time } from "node:console";
import {
  deleteCloudinary,
  uploadOnCloudinary,
} from "../config/cloudinary.config";
import { categoryRepository } from "../repositories/category.repository";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    parent,
    seoTitle,
    seoDescription,
    keywords,
    order,
  } = req.body;
  if (!name) {
    throw new ApiError(400, "Category name is required");
  }
  let imageData = null;
  let bannerData = null;
  if (req.files?.image?.[0]) {
    const uploadResponse = await uploadOnCloudinary(req.files.image[0].path);
    if (uploadResponse) {
      imageData = {
        url: uploadResponse.url,
        publicId: uploadResponse.public_id,
      };
    }
  }
  if (req.files?.banner?.[0]) {
    const uploadResponse = await uploadOnCloudinary(req.files.banner[0].path);
    if (uploadResponse) {
      bannerData = {
        url: uploadResponse.url,
        publicId: uploadResponse.public_id,
      };
    }
  }
  const seoData = {
    title: seoTitle || name,
    description: seoDescription || description,
    keyword: keywords ? keywords.split(",").map((k) => k.trim()) : [],
  };
  const category = await categoryRepository.create({
    name,
    description,
    parent: parent || null,
    image: imageData,
    banner: bannerData,
    seo: seoData,
    order,
  });
  return res
    .status(201)
    .json(
      new ApiResponse(201, category, "Category created successfully with media")
    );
});
const updateCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    parent,
    seoTitle,
    seoDescription,
    keywords,
    order,
    isActive,
    isFeatured,
  } = req.body;
  const { categoryId } = req.params;
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  let updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (parent !== undefined) updateData.parent = parent;
  if (req.body.seoTitle || req.body.seoDescription || req.body.keywords) {
    updateData.seo = {
      title: req.body.seoTitle || category.seo?.title,
      description: req.body.seoDescription || category.seo?.description,
      // keywords Array processing
      keyword: req.body.keywords
        ? req.body.keywords.split(",").map((k) => k.trim())
        : category.seo?.keyword,
    };
  }
  if (order !== undefined) updateData.order = order;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

  if (req.files?.image?.[0]) {
    if (category.image?.publicId) {
      await deleteCloudinary(category.image?.publicId);
    }
    const uploadResponse = await uploadOnCloudinary(req.files.image[0].path);
    if (!uploadResponse) {
      throw new ApiError(
        400,
        "Something is missing while image upload in cloudinary"
      );
    }
    updateData.image = {
      url: uploadResponse.url,
      publicId: uploadResponse.public_id,
    };
  }
  if (req.files?.banner?.[0]) {
    if (category.banner?.publicId) {
      await deleteCloudinary(category.banner?.publicId);
    }
    const uploadResponse = await uploadOnCloudinary(req.files.banner[0].path);
    if (!uploadResponse) {
      throw new ApiError(400, "Banner upload failed");
    }
    updateData.banner = {
      url: uploadResponse.url,
      publicId: uploadResponse.public_id,
    };
  }
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided for update");
  }
  const categoryUpdate = await categoryRepository.updateById(
    categoryId,
    updateData
  );
  return res
    .status(200)
    .json(new ApiResponse(200, categoryUpdate, "Category update successfully"));
});
const getCategories = asyncHandler(async (req, res) => {
  const categoryTree = await categoryRepository.getCategoryTree();

  return res
    .status(200)
    .json(
      new ApiResponse(200, categoryTree, "Category tree fetched successfully")
    );
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  const hashChildren = await categoryRepository.findOne({ parent: categoryId });
  if (hashChildren) {
    throw new ApiError(
      400,
      "Cannot delete! This category has sub-categories. Please delete them first."
    );
  }
  if (category.image?.publicId) {
    await deleteCloudinary(category.image.publicId);
  }
  if (category.banner?.publicId) {
    await deleteCloudinary(category.banner.publicId);
  }
  await categoryRepository.deleteById(categoryId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});
// in this controller only chnages state not delete all category
const softDelete = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await categoryRepository.findById(categoryId);
  if (!category || category.isDeleted) {
    throw new ApiError(404, "Category not found or already deleted");
  }
  const hashChildren = await categoryRepository.findOne({
    parent: categoryId,
    isDelete: false,
  });
  if (hashChildren) {
    throw new ApiError(
      400,
      "Cannot delete! This category has active sub-categories."
    );
  }
  await categoryRepository.updateById(categoryId, {
    isDelete: true,
    deletedAt: new Date(),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Category moved to trash (Soft Deleted)"));
});
// -----------restore workflow-------------
/*
1. parent Validation: if i restore a child cat as (laptop) and laptop parent cat is Electronic.
and at now electronic(parent cat) already isDelete.then your laptop not show in list.
so that we need to restor parent cat also and notifi user.

2.Unique name: if you make a cat name laptop but laptop cat already have in isdelete=true;
then when you restor (laptop cat) isDelete=false. 
then it may be conflit with old vs new laptop-cat
*/
const restoreCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new ApiError(400, "Category not found");
  }
  if (!category.isDelete) {
    throw new ApiError(400, "Category already active");
  }
  category.isDelete = false;
  category.deletedAt = null;
  await category.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        category,
        "Category restored successfully from trash"
      )
    );
});
export { createCategory, updateCategory, getCategories };
