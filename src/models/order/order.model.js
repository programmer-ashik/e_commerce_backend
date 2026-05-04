import mongoose, { Schema, model } from "mongoose";
import { cartItemSchema } from "../cart/cartItem.schema";
import { addressSchema } from "../userModel/sub-schemas/addresh.schema";
import { paymentScheme } from "./subSchema/pymentSchema";
import { deliverySchema, timelineSchema } from "./subSchema/deliverySchema";

const orderScheme = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () =>
        `ORD-${date.now()}-${Math.rendom().toString(26).substrt(2, 6).toUpperCase()}`,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
    // -----relationShip----
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [cartItemSchema],
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: String,
    couponDiscount: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    // ---------addresh-----
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    // ----payment---
    payment: paymentScheme,
    // delivery--------
    delivery: deliverySchema,
    status: {
      type: String,
      enum: [
        "pending", // Order placed, payment pending
        "processing", // Payment confirmed, processing
        "confirmed", // Order confirmed by vendor
        "shipped", // Shipped by vendor
        "delivered", // Delivered to customer
        "cancelled", // Cancelled by customer/vendor
        "refunded", // Refunded
        "returned", // Returned by customer
      ],
      default: "pending",
      index: true,
    },
    // all notes
    customerNote: String,
    vendorNote: String,
    adminNote: String,
    // Timeline
    timeline: [timelineSchema],
    cancellation: {
      requestedAt: Date,
      reason: String,
      approvedAt: Date,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
      },
    },
    // return requiest
    returnRequest: {
      requestedAt: Date,
      reason: String,
      items: [
        {
          productId: mongoose.Schema.Types.ObjectId,
          quantity: Number,
          reason: String,
        },
      ],
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
      },
    },
    // Analytics
    isPaid: {
      type: Boolean,
      default: false,
    },
    isNotified: {
      type: Boolean,
      default: false,
    },

    // Completion
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true } }
);
export const Order = model("Order", orderScheme);
