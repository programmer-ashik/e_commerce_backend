import mongoose, { Schema, model } from "mongoose";

const productScheme = new Schema({}, { timestamps: true });
export const Product = model("Product", productScheme);
