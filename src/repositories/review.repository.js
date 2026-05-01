import { Review } from "../models/Review.models";

class ReviewRepository {
  async getProductReviews(productId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const review = await Review.find({ product: productId })
      .populate("user", "name profile.avatar")
      .sort("-createdAt")
      .lean()
      .skip(skip)
      .limit(limit);
    const totalReviews = await Review.countDocuments({ product: productId });
    return {
      review,
      pagination: {
        totalReviews,
        totalPages: Math.cell(totalReviews / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  }
}
export const reviewRepository = new ReviewRepository();
