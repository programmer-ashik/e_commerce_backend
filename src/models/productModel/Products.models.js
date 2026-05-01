import mongoose from "mongoose";
import slugify from "slugify";
import productSchema from "./product/product.schema.js";
import { ApiError } from "../../utils/ApiError.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

// ========== VIRTUALS ==========
productSchema.virtual("discountPercentage").get(function () {
  if (this.price > 0 && this.finalPrice > 0) {
    return Math.round(((this.price - this.finalPrice) / this.price) * 100);
  }
  return 0;
});

// ========== PRE-SAVE MIDDLEWARE ==========
productSchema.pre("save", async function (next) {
  // ১. স্লাগ জেনারেট করা
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // ২. ফাইনাল প্রাইস ক্যালকুলেশন
  if (this.isModified("price") || this.isModified("discount")) {
    this.finalPrice = this.price - this.price * (this.discount / 100);
  }

  // ৩. ডুপ্লিকেট স্লাগ হ্যান্ডলিং
  if (this.isModified("slug")) {
    const existing = await this.constructor.findOne({ slug: this.slug });
    if (existing && existing._id.toString() !== this._id.toString()) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  next();
});

// ========== METHODS ==========
// -----check if products is in stock------
productSchema.methods.isInStock = function (quantity = 1) {
  return this.stock >= quantity;
};
// ------reduce stock-----
productSchema.methods.reduceStock = async function (quantity) {
  if (!this.isInStock(quantity)) {
    throw new ApiError(403, "Insufficient stock");
  }
  this.stock -= quantity;
  this.totalSold += quantity;
  await this.save();
  return true;
};
// -------increase stock (for cancellations/returns)---------
productSchema.methods.reduceStock = async function (quantity) {
  this.stock += quantity;
  await this.save();
  return true;
};

productSchema.methods.incrementViews = async function () {
  this.totalViews += 1;
  await this.save();
  return true;
};
productSchema.plugin(mongooseAggregatePaginate);
export const Product = mongoose.model("Product", productSchema);
