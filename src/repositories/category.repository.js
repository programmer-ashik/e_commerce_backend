import { populate } from "dotenv";
import { Category } from "../models/Category.models";
import BaseRepository from "./base.repository";

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }
  async getFullTree() {
    return await this.model
      .find({ parent: null })
      .populate({
        path: "children",
        populate: { path: "children" },
      })
      .sort({ order: 1 });
  }
  async findBySlug(slug) {
    return await this.model.findOne({ slug });
  }
}
export const categoryRepository = new CategoryRepository();
