import mongoose, { Schema, model } from "mongoose";

const categoryScheme = new Schema({}, { timestamps: true });
export const Category = model("Category", categoryScheme);
