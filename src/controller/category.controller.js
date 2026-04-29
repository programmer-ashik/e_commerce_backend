import { uploadOnCloudinary } from "../config/cloudinary.config";
import { categoryRepository } from "../repositories/category.repository";
import { asyncHandler } from "../utils/asyncHandler";

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, seo, order } = req.body;
  if (!name) {
    throw new ApiError(400, "Category name is required");
  }
  let imageData = null;
  let bannerData = null;
  if (req.files?.image?.[0]) {
    const uploadResponse = await uploadOnCloudinary(req.files?.image?.[0].path);
    if (uploadResponse) {
      imageData = {
        url: uploadResponse.url,
        publicId: uploadResponse.public_id,
      };
    }
  }
  if (req.files?.banner?.[0]) {
    const uploadResponse = await uploadOnCloudinary(
      req.files?.banner?.[0].path
    );
    if (uploadResponse) {
      bannerData = {
        url: uploadResponse.url,
        publicId: uploadResponse.public_id,
      };
    }
  }
  const category = await categoryRepository.create({
    name,
    description,
    parent: parent || null,
    image: imageData,
    banner: bannerData,
    seo,
    order,
  });
  return res
    .status(201)
    .json(
      new ApiResponse(201, category, "Category created successfully with media")
    );
});
export { createCategory };
