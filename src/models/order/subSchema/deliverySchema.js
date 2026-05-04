import { Schema } from "mongoose";

export const deliverySchema = new Schema({
  provider: {
    type: String,
    enum: ["pathao", "redx", "sundarban", "self"],
    required: true,
  },
  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  deleveryAt: Date,
  status: {
    type: String,
    enum: [
      "pending",
      "picked_up",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "returned",
    ],
    default: "pending",
  },
  cost: {
    type: Number,
    default: 0,
  },
  notes: String,
});
export const timelineSchema = new mongoose.Schema(
  {
    status: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);
