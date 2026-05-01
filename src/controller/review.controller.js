import { isValidJWT } from "zod/v4/core";
import { Review } from "../models/Review.models";
import { reviewRepository } from "../repositories/review.repository";
import { asyncHandler } from "../utils/asyncHandler";
import { isValidObjectId } from "mongoose";

const createRrview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user?._id;
  //   check existing review
  const existingReview = await Review.findOne({
    user: userId,
    product: productId,
  });
  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this product");
  }
  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment,
    isVerifiedPurchase: true,
  });
  return res
    .status(201)
    .json(
      new ApiResponse(201, review, "Review added and product rating updated")
    );
});
const getProductsReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product Id");
  }
  const productsReview = await reviewRepository.getProductReviews(productId, {
    page,
    limit,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, productsReview, "Product Review fetch Successfully")
    );
});
export const { createRrview, getProductsReview };
