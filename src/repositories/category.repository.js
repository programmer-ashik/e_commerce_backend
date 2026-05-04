import { populate } from "dotenv";

import BaseRepository from "./base.repository";
import { Category } from "../models/category.model.js";

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
  // for making a category tree
  async getCategoryTree() {
    // get all categories
    const allCategories = await this.model.find().sort({ order: 1 });
    // recursive function make tree
    const buildTree = (parentId = null) => {
      const categoryList = [];
      let categories;
      if (parentId == null) {
        categories = allCategories.filter((cat) => cat.parent == null);
      } else {
        // find child under particular parent
        categories = allCategories.filter(
          (cat) => String(cat.parent) === String(parentId)
        );
        for (let cat of categories) {
          categoryList.push({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            image: cat.image,
            level: cat.level,
            // function call self for children
            children: buildTree(cat._id),
          });
        }
        return categoryList;
      }
    };
  }
}
export const categoryRepository = new CategoryRepository();
