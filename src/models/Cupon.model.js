import mongoose, { Schema, model } from "mongoose";

const cuponScheme = new Schema({}, { timestamps: true });
export const Cupon = model("Cupon", cuponScheme);
