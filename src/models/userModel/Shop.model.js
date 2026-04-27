import { model, Schema } from "mongoose";

const shopSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Shop name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Discription cannot excees 1000 characters"],
    },
    logo: {
      url: String,
      publicId: String,
    },
    banner: {
      url: String,
      publicId: String,
    },
    estabalishAt: Date,
    totalSales: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    approvedAt: Date,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
// ======indexing for performance======
shopSchema.index({ name: 1 });
shopSchema.index({ createdAt: -1 });
// =====midleware====
shopSchema.pre("save", function (next) {
  if (!this.isModified("isActive")) {
    return next();
  }
  if (this.isActive == true) {
    this.approvedAt = Date.now();
  }
});
export const Shop = model("Shop", shopSchema);
