import mongoose, { Schema, model } from "mongoose";
import { cartItemSchema } from "../cart/cartItem.schema";
import { addressSchema } from "../userModel/sub-schemas/addresh.schema";
import { paymentScheme } from "./subSchema/pymentSchema";
import { deliverySchema, timelineSchema } from "./subSchema/deliverySchema";
import { ApiError } from "../../utils/ApiError";
import { Product } from "../productModel/Products.model";

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () =>
        `ORD-${Date.now()}-${Math.random().toString(26).substring(2, 6).toUpperCase()}`,
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
    // pricing systemm
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
    // ---------delivery--------
    delivery: deliverySchema,
    // ---------status system-----
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
// ==========INDEXES==========
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "items.vendor": 1, createdAt: -1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ createdAt: -1 });
// =========virtuals==========
orderSchema.virtual("isCancellable").get(function () {
  const cancellableStatus = ["pending", "processing", "confirmed"];
  return cancellableStatus.includes(this.status);
});
orderSchema.virtual("isReturnable").get(function () {
  const daysSinceDelivery =
    (Date.now() - this.delivery.deliveryAt) / (1000 * 60 * 60 * 24);
  return this.status === "delivered" && daysSinceDelivery <= 7;
});

// ==========PRE--SAVE==========
orderSchema.pre("save", function (next) {
  // ========making invoice======
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, 0);
    const random = Math.floor(Math.random() * 10000);
    this.invoiceNumber = `INV-${year}${month}-${random}`;
  }
  if (this.isModified("status")) {
    const statusMessages = {
      pending: "Order placed successfully",
      processing: "Order is being processed",
      confirmed: "Order confirmed by vendor",
      shipped: "Order has been shipped",
      delivered: "Order delivered successfully",
      cancelled: "Order cancelled",
      refunded: "Order refunded",
    };
    this.timeline.push({
      status: this.status,
      description:
        statusMessages[this.status] || `Order status changed to ${this.status}`,
      timestamp: new Date(),
    });
    // Set completed date
    if (this.status === "delivered" && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === "cancelled" && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});
// ========Update oorder status=========
orderSchema.methods.updateStatus = async function (
  newStatus,
  updatedBy,
  session
) {
  this.status = newStatus;
  // update payment status if needed
  if (this.status === "delivered" && this.payment.status === "pending") {
    this.payment.status = "completed";
  }
  // add timeline entry
  const statusMessages = {
    pending: "Order placed successfully",
    processing: "Order is being processed",
    confirmed: "Order confirmed by vendor",
    shipped: "Order has been shipped",
    delivered: "Order delivered successfully",
    cancelled: "Order cancelled",
    refunded: "Order refunded",
  };
  this.timeline.push({
    status: newStatus,
    description:
      statusMessages[newStatus] || `Order status changed to ${this.status}`,
    timestamp: new Date(),
    updatedBy: updatedBy,
  });
  if (this.status === "delivered" && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.status === "cancelled" && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  if (session) {
    return await this.save({ session });
  }
  return await this.save();
};
// ========get user order=======
orderSchema.statics.getUserOrders = function (userId, status = null) {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .sort("-createdAt")
    .populate("items.product", "name images");
};
// ========get sales report for admin=======
orderSchema.statics.getSalesReport = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["delivered", "completed"] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        averageOrderValue: { $avg: "$totalAmount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

orderSchema.statics.processCheckout = async function () {};
export const Order = model("Order", orderSchema);
