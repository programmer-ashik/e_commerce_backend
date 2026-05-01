import mongoose, { Schema, model } from "mongoose";

const reviewScheme = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 3,
      min: 3,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Comments must be within 500 words"],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
reviewScheme.index({ user: 1, product: 1 }, { unique: true });
export const Review = model("Review", reviewScheme);
reviewScheme.statics.calculateAvarageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avaRating: { $avg: "$rating" },
        oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
      },
    },
  ]);
  if (stats.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      totalReviews: stats[0].nRating,
      averageRating: Math.round(stats[0].avgrating * 10) / 10,
      ratingDistribution: {
        1: stats[0].oneStar,
        2: stats[0].twoStar,
        3: stats[0].threeStar,
        4: stats[0].fourStar,
        5: stats[0].fiveStar,
      },
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  }
};
reviewScheme.post("save", function () {
  this.constructor.calculateAvarageRating(this.product);
});
reviewScheme.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calculateAvarageRating(doc.product);
  }
});
