import mongoose, { Schema, model } from "mongoose";

const reviewScheme = new Schema({}, { timestamps: true });
export const Review = model("Review", reviewScheme);
