import { Schema } from "mongoose";

export const profileSchema = new Schema(
  {
    avatar: { url: String, publicId: String },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be excced 500 character"],
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },
  },
  { _id: false }
);
