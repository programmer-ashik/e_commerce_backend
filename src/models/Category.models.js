import mongoose, { Schema, model } from "mongoose";
import slugify from "slugify"; // এটি ইম্পোর্ট করতে ভুলবেন না

const categoryScheme = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is Required"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description is too long"], // typo fix
    },
    //========= Hierarchical structure =======
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    ancestors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    level: {
      type: Number, // fix: String থেকে Number করা হয়েছে
      default: 0,
      min: 0,
    },
    // ======= media =====
    image: {
      url: String,
      publicId: String, // fix: puublicId -> publicId
      alt: String,
    },
    banner: {
      url: String,
      publicId: String, // fix: puublicId -> publicId
    },
    icon: String,
    // ===== SEO =======
    seo: {
      title: String,
      description: String,
      keyword: [String],
    },
    productCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
categoryScheme.index({ slug: 1 });
categoryScheme.index({ parent: 1, order: 1 }); // fix: parant -> parent

// Virtuals - fix syntax
categoryScheme.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// ------ presave middleware -------
categoryScheme.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (this.isModified("parent")) {
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.ancestors = [...parentCategory.ancestors, parentCategory._id];
        this.level = parentCategory.level + 1;
      }
    } else {
      // if remove parent
      this.ancestors = [];
      this.level = 0;
    }
  }
  next();
});
categorySchema.pre(/^find/, function (next) {
  // { isDeleted: false }
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Category = model("Category", categoryScheme);
