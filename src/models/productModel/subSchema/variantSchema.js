export const variantSchema = new Schema(
  {
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    attributes: {
      color: String,
      size: String,
      material: String,
      weight: Number,
      dimensions: { length: Number, width: Number, height: Number },
    },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [
      {
        url: String,
        publicId: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);
