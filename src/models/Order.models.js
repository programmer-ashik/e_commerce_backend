import mongoose, { Schema, model } from "mongoose";

const orderScheme = new Schema({}, { timestamps: true });
export const Order = model("Order", orderScheme);
