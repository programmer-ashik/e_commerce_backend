import mongoose, { Schema, Types, model } from "mongoose";
import { profileSchema } from "./sub-schemas/profile.schema.js";
import { addressSchema } from "./sub-schemas/addresh.schema.js";
import { preferenceSchema } from "./sub-schemas/preference.schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Name is Required"],
      trim: true,
      maxlength: [50, "Name can not be more then 50 Characters"],
    },
    email: {
      type: String,
      required: [true, "Pleace Provide Vaid Email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please Provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "vendor", "admin", "super_admin"],
      default: "user",
    },
    profile: profileSchema,
    addresses: [addressSchema],
    preferences: preferenceSchema,
    // Referenced Data (Keeps User model light)
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    security: {
      type: Schema.Types.ObjectId,
      ref: "Security",
    },
    // user products stats need to frequently used for analytics
    stats: {
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      joinDate: { type: Date, default: Date.now },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
// ==============indexing for performance============
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "stats.totalOrders": -1 }); //for top coustomer
// =======vartual field======
userSchema.virtual("accountAge").get(function () {
  const days = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return Math.floor(days);
});
// ====middleware hooks==
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    // we give ApiError
  }
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = model("User", userSchema);
