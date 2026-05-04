import { Schema } from "mongoose";
import { cartItemSchema } from "./cartItem.schema.js";

export const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    subTotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: { type: Number, default: 0 },
    coupon: {
      code: String,
      discount: Number,
      type: {
        type: String,
        enum: ["percentage", "fixed"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
  { timestamps: true }
);
