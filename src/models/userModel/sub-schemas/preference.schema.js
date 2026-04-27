import { Schema } from "mongoose";

export const preferenceSchema = Schema(
  {
    newsletter: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: "bn",
    },
    currency: {
      type: String,
      default: "BDT",
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
  },
  { _id: false }
);
