import { Schema } from "mongoose";

export const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sku: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    total: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },

    // Review status
    isReviewed: {
      type: Boolean,
      default: false,
    },
    // snapshot----
    snapshot: {
      name: String,
      image: String,
      vendor: {
        id: Schema.Types.ObjectId,
        name: String,
      },
      sku: String,
    },
  },
  { timestamps: true }
);
