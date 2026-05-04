import { model, Schema } from "mongoose";
import { uppercase } from "zod";
import { required } from "zod/mini";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      default: true,
    },
    maxDiscountAmount: {
      type: Number,
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    endData: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    couponSource: {
      type: String,
      enum: ["admin", "vendor"],
      default: null,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
export const Coupon = model("Coupon", couponSchema);
