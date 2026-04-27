import mongoose, { Schema, model } from "mongoose";

const cartScheme = new Schema({}, { timestamps: true });
export const Cart = model("Cart", cartScheme);
