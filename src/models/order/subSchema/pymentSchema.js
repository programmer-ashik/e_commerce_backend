import mongoose, { Schema, model } from "mongoose";

export const paymentScheme = new Schema({
  method: {
    type: String,
    enum: [
      "cod",
      "card",
      "mobile_banking",
      "bank_transfer",
      "sslcommerz",
      "stripe",
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: String,
  paidAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  details: {
    type: Map,
    of: String,
  },
});
