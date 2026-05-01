import { BaseRepository } from "./base.repository.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }
  async createProduct(productData) {
    return await this.create(productData);
  }
  async updateStock(productId, quantity, type = "decrease") {
    const product = await this.findById(productId);
    if (!product) return null;

    if (type === "decrease") {
      product.stock -= quantity;
      product.totalSold += quantity;
    } else {
      product.stock += quantity;
    }

    return await product.save();
  }

  async advancedSearch(filters = {}, pagination = { page: 1, limit: 10 }) {
    const {
      searchTerm,
      category, //categoryId
      minPrice,
      maxPrice,
      rating,
      sortBy = "createdAt",
      sortOrder = -1,
      page = 1,
      limit = 10,
    } = filters;
    const pipeline = [];
    if (searchTerm) {
      pipeline.push({
        $match: { $text: { $search: searchTerm } },
      });
    }
    if (category) {
      pipeline.push({
        $match: { category: new mongoose.Types.ObjectId(category) },
      });
    }
    if (filters.vendor) {
      pipeline.push({
        $match: { vendor: new mongoose.Types.ObjectId(filters.vendor) },
      });
    }
    const statusFilter = filters.vendor
      ? filters.status || { $ne: "deleted" }
      : "active";
    pipeline.push({
      $match: { status: statusFilter, isActive: true },
    });

    if (minPrice || maxPrice) {
      const priceMatch = {};
      if (minPrice) priceMatch.$gte = Number(minPrice);
      if (maxPrice) priceMatch.$lte = Number(maxPrice);
      pipeline.push({ $match: { finalPrice: priceMatch } });
    }
    // -----------sorting logic-------------
    const sortField = sortBy === "price" ? "finalPrice" : sortBy;
    pipeline.push({ $sort: { [sortField]: Number(sortOrder) } });
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    });
    const productAggregate = this.model.aggregate(pipeline);
    const options = {
      page: Number(page),
      limit: Number(limit),
    };
    return this.model.aggregatePaginate(productAggregate, options);
  }
  async updateProduct(productId, updateData) {
    return await this.model.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
  async softDelete(productId) {
    return await this.model.findByIdAndUpdate(
      productId,
      {
        isActive: false,
        status: "archived",
      },
      { new: true }
    );
  }
  // getproductsdetails
  async getProductDetails(productId) {
    const product = await this.model.findOne({
      _id: productId,
      isActive: true,
    });
    if (!product) return null;
    const relatedProducts = await this.model
      .find({
        category: product.category._id,
        _id: { $ne: productId },
        status: "active",
        isActive: true,
      })
      .limit(5)
      .select("name price discount images calculatedFinalPrice");
    return { product, relatedProducts };
  }
}

export const productRepository = new ProductRepository();
