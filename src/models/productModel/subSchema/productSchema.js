import { Schema } from "mongoose";
import { variantSchema } from "./variantSchema";

const productSchema = new Schema(
  {
    // Basic Info
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
      minlength: [3, "Name must be at least 3 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      index: true,
    },
    description: {
      short: { type: String, maxlength: 500 },
      long: { type: String, required: true },
    },
    // Pricing & Inventory
    price: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be less than 0%"],
      max: [100, "Discount cannot be more than 100%"],
      default: 0,
    },
    finalPrice: { type: Number },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    lowStockThreshold: { type: Number, default: 10 },
    // import form
    variants: [variantSchema],

    // Relationships
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subcategory: { type: Schema.Types.ObjectId, ref: "Category" },
    brand: { type: String, trim: true },

    // Media
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        alt: String,
        isMain: { type: Boolean, default: false },
        order: Number,
      },
    ],

    // Shipping (আপনার রিকোয়েস্ট অনুযায়ী যোগ করা হলো)
    shipping: {
      weight: { type: Number, default: 0 },
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      isFreeShipping: { type: Boolean, default: false },
      shippingCost: { type: Number, default: 0 },
      estimatedDelivery: String,
    },

    // SEO & Features
    specifications: { type: Schema.Types.Map, of: String, default: {} },
    tags: [{ type: String, trim: true, lowercase: true, index: true }],
    seo: { title: String, description: String, keywords: [String] },

    // Ratings & Stats
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    totalReviews: { type: Number, default: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
    totalSold: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: {
        values: [
          "draft",
          "pending",
          "active",
          "inactive",
          "deleted",
          "archived",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "draft",
      index: true,
    },
    isActive: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default productSchema;
