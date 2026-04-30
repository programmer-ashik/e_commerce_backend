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
        $match: { $text: { search: searchTerm } },
      });
    }
    // active and not deleted
    pipeline.push({
      $match: {
        "status.values": "active",
        isActive: true,
      },
    });

    if (category) {
      pipeline.push({
        $match: { category: new mongoose.Types.ObjectId(category) },
      });
    }

    pipeline.push({
      $addFields: {
        calculatedFinalPrice: {
          $subtract: [
            "$price",
            { $multiply: ["$price", { $divide: ["$discount", 100] }] },
          ],
        },
      },
    });

    if (minPrice || maxPrice) {
      const priceMatch = {};
      if (minPrice) priceMatch.$gte = Number(minPrice);
      if (maxPrice) priceMatch.$lte = Number(maxPrice);
      pipeline.push({ $match: { calculatedFinalPrice: priceMatch } });
    }
    // -----------sorting logic-------------
    const sortField = sortBy === "price" ? "calculatedFinalPrice" : sortBy;
    pipeline.push({ $sort: { [sortField]: Number(limit) } });
    // ---------------pagenations---------
    pipeline.push({ $skip: (Number(page) - 1) * Number(limit) });
    pipeline.push({ $limit: Number(limit) });
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    });
    return this.model.aggregate(pipeline);
  }
}

export const productRepository = new ProductRepository();
