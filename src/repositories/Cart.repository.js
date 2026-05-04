import { Cart } from "../models/cart/cart.model";
import { Product } from "../models/productModel/Products.model";
import { couponRepository } from "./coupon.repository";

class CartRepository {
  // --static methods-----
  async getCart(userId) {
    return await Cart.getCart(userId);
  }
  //---add items-
  async addItem(userId, productId, quantity) {
    const cart = await Cart.getCart(userId);
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return await cart.addItem(product, quantity);
  }
  //-------------apply coupon to cart---------
  async applyCouponToCart(userId, couponCode) {
    const cart = await Cart.getCart(userId);

    const coupon = await couponRepository.validateCoupon(
      couponCode,
      cart.subTotal,
      userId
    );
    cart.coupon = coupon._id;
    cart.appliedCouponCode = coupon.couponCode;
    // -----discount calculations------
    if (coupon.type === "percentage") {
      const discountPrice = (cart.subTotal * coupon.discountValue) / 100;
      cart.discount = coupon.maxDiscountAmount
        ? Math.min(discountPrice, coupon.maxDiscountAmount)
        : discountPrice;
    } else {
      cart.discount = coupon.discountValue;
    }
    return await cart.save();
  }
  async removeItem(userId, productId) {
    const cart = await Cart.getCart(userId);
    if (!cart) throw new ApiError(404, "Cart not found");
    return await cart.removeItem(productId);
  }
}
export const cartRepository = new CartRepository();
