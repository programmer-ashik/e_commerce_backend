import mongoose from "mongoose";

export const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: [true, "Street address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "Bangladesh",
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);
