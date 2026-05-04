import { Coupon } from "../models/coupon/coupon.model";
import { ApiError } from "../utils/ApiError";

class CouponRepository {
  async validateCoupon(couponCode, subTotal, userId) {
    const coupon = await Coupon.findOne({ couponCode, isActive: true });
    if (!coupon) {
      throw new ApiError(404, "Invalid or expired coupon code");
    }
    if (new Date() > coupon.endDate) {
      throw new ApiError(400, "This coupon has expired");
    }
    if (subTotal < coupon.minOrderAmount) {
      throw new ApiError(
        400,
        `Minimum purchase of ${coupon.minOrderAmount} required`
      );
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, "Coupon usage limit reached");
    }
    return coupon;
  }
  async incrementUsage(couponId){
    return await Coupon.findByIdAndUpdate(couponId,{$inc:{usedCount:1}})
  }
}
export const couponRepository = new CouponRepository();
