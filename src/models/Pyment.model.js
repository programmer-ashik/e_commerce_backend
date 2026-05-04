import mongoose, { Schema, model } from "mongoose";

const paymentScheme = new Schema({}, { timestamps: true });
export const Payment = model("Payment", paymentScheme);
