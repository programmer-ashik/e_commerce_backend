import mongoose, { Schema, model } from "mongoose";

const notificationScheme = new Schema({}, { timestamps: true });
export const Notification = model("Notification", notificationScheme);
