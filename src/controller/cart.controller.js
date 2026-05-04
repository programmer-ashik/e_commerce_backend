import { isValidObjectId } from "mongoose";
import { cartRepository } from "../repositories/Cart.repository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }
  const cart = await cartRepository.getCart(userId);
  if (!cart) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fatched Successfully"));
});
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { productId, quantity } = req.body;
  const cart = await cartRepository.addItem(userId, productId, quantity);
  if (!cart) {
    throw new ApiError(403, "Bad request");
  }
  return res.status(200).json(new ApiResponse(200, cart, "Item Add to Cart"));
});
const applyCoupon = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { couponCode } = req.body;
  const cart = await cartRepository.applyCouponToCart(userId, couponCode);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Coupon applied successfully"));
});
const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user?._id;
  const cart = await cartRepository.removeItem(userId, productId);
  if (!cart) {
    throw new ApiError(404, "CartItem Not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Items remove from Cart"));
});
export { getCart, addToCart, applyCoupon, removeItem };
