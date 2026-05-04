import { model } from "mongoose";
import { cartSchema } from "./cart.schema";
// =========indexes=============
cartSchema.index({ user: 1, isActive: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//------------Pre-save ---- middleware---------
cartSchema.pre("save", async function (next) {
  // calculate total
  this.subTotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
  // apply discount if exists
  if (this.coupon) {
    if (this.coupon.type === "percentage") {
      this.discount = (this.subTotal * this.coupon.discount) / 100;
    } else {
      this.discount = this.coupon.discount || 0;
    }
  } else {
    this.discount = 0;
  }
  this.total = Math.max(0, this.subTotal - this.discount);
  next();
});
// --------instance methods----------
cartSchema.methods.addItem = async function (product, quantity = 1) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === product._id.toString()
  );
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.total = existingItem.quantity * existingItem.price;
  } else {
    this.items.push({
      product: product._id,
      quantity: quantity,
      name: product.name,
      price: product.finalPrice || product.price,
      total: quantity * (product.finalPrice || product.price),
      snapshot: {
        name: product.name,
        image: product.images?.[0]?.url,
        vendor: {
          id: product.vendor,
          name: product.vendorName,
        },
        sku: product.sku,
      },
    });
    return await this.save();
  }
};
cartSchema.methods.removeItem = async function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return await this.save();
};
// --------update item quantity----------
cartSchema.methods.updateQuantity = async function (productId, quantity) {
  const item = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }
    item.quantity = quantity;
    item.total = quantity * item.price;
    return await this.save();
  }
  return this;
};
// ---------clear cart------
cartSchema.methods.clear = async function () {
  this.items = [];
  this.coupon = null;
  await this.save();
  return this;
};
// ----------apply-coupon--------
cartSchema.methods.applyCoupon = async function (couponDoc) {
  this.coupon = couponDoc._id;
  this.appliedCouponCode = couponDoc.code;
  return await this.save();
};
//----------remove coupon-----------
cartSchema.methods.removeCoupon = async function () {
  this.coupon = null;
  this.appliedCouponCode = null;
  this.discount = 0;
  return await this.save();
};

// ----------------statics methods--------------
cartSchema.statics.getCart = async function (userId) {
  let cart = await this.findOne({ user: userId, isActive: true }).populate(
    "items.product",
    "name price finalPrice images stock"
  );
  if (!cart) {
    const cart = await this.create({ user: userId, item: [] });
  }
  let changed = false;
  for (const item of cart.item) {
    if (item.product && item.product.stock < item.quantity) {
      item.quantity = item.product.stock;
      item.total = item.quantity * item.price;
      changed = true;
    }
  }
  if (changed) await cart.save();
  return cart;
};
//============manage gust cart with user cart (after login)
cartSchema.statics.mergeCarts = async function (userId, guestCartItems) {
  const userCart = await this.getCart(userId);
  for (const guestItem of guestCartItems) {
    await userCart.addItem(guestItem.product, guestItem.quantity);
  }
  return userCart;
};
export const Cart = model("Cart", cartSchema);
