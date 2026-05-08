import mongoose from "mongoose";
import { Order } from "../models/order/order.model";
import { Product } from "../models/productModel/Products.model";
import { ApiError } from "../utils/ApiError";
import BaseRepository from "./base.repository";

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }
  //==========placeorder========
  async createOrder(payload) {
    return await this.model.create(payload);
  }
  //=====user order======
  async getUserOrders(userId, status) {
    return await Order.getUserOrders(userId, status);
  }
  // ✅ Get Single Order
  async getOrderById(orderId) {
    const order = await this.model.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    return order;
  }
  // need a search query by orderNumber
  async getOrderByOrderNumber(orderNumber) {
    const order = await this.model.findOne({ orderNumber });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    return order;
  }
  //==========update status==========
  async updateOrderStatus(orderId, status, userId) {
    const order = await this.model.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    return await order.updateStatus(status, userId);
  }
  async cancelOrderWithSession(orderId, reason, userId) {
    const session = await mongoose.session();
    session.startTransaction();
    try {
      const order = await this.model.findById(orderId);
      if (!order) {
        throw new ApiError(404, "Order not found");
      }
      if (!order.isCancellable) {
        throw new ApiError(400, "Order cannot be cancelled at this stage");
      }
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.stock += item.quantity;
          product.totalSold -= item.quantity;
          await Product.save({ session });
        }
      }
      // 4. Update Order Cancellation Details
      order.cancellation = {
        requestedAt: new Date(),
        reason: reason,
        approvedAt: new Date(),
        status: "approved",
      };
      await order.updateStatus("cancelled", userId, session);
      //   =======finalize Transaction=====
      await session.commitTransaction();
      return order;
    } catch (error) {
      // Revert everything if anything fails
      await session.abortTransaction();
      //after making logging we use
      throw Error(error);
    } finally {
      session.endSession();
    }
  }
  async getSalesReport(startDate, endDate) {
    return await Order.getSalesReport(startDate, endDate);
  }
  async deliverOrderAndDeductStock(orderId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await this.model.findById(orderId).session(session);
      if (!order) throw new ApiError(404, "Order not found");
      if (order.status === "delivered") {
        throw new ApiError(400, "Order is already delivered");
      }
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product || product.stock < item.quantity) {
          const pName =
            item.name || (item.snapshot && item.snapshot.name) || "Product";
          throw new ApiError(400, `Product ${pName} is out of stock!`);
        }
        product.stock -= item.quantity;
        product.totalSold += item.quantity;
        await product.save({ session });
      }
      await order.updateStatus("delivered", userId, session);
      //   after all work successfully complate save in db permanently
      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  // vendor selse reports
  async getVendorSalesReport(vendorId, startDate, endDate) {
    return this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["delivered", "completed"] },
          "items.snapshot.vendor": new mongoose.Types.ObjectId(vendorId),
        },
      },
      { $unwind: "$items" }, //Break the items array into individual documents
      {
        $match: {
          "items.snapshot.vendor": new mongoose.Types.ObjectId(vendorId),
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalOrders: { $addToSet: "$_id" },
          vendorRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          itemsSold: { $sum: "$items.quantity" },
        },
      },
      // --project---
      {
        $project: {
          _id: 1,
          totalOrders: { $size: "$totalOrders" },
          vendorRevenue: 1,
          itemsSold: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
  async getOrderByTransactionId(tranId) {
    return await this.model.findOne({ "paymnet.transactionId": tranId });
  }
  async updatePaymentStatus(
    orderId,
    { status, transactionId, paymentDetails }
  ) {
    return await this.model.findByIdAndUpdate(
      orderId,
      {
        $set: {
          "payment.status": status,
          "payment.paymentDetails": paymentDetails,
          "payment.paidAt": status === "completed" ? new Date() : null,
          isPaid: status === "completed",
        },
      },
      { new: true }
    );
  }
}
export const orderRepository = new OrderRepository();
