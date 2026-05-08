import { orderRepository } from "../repositories/order.repository";
import { paymentService } from "../services/payment.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
const validStatus = [
  "pending",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "returned",
];
const placeNewOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, subTotal, totalAmount } =
    req.body;
  const userId = req.user?._id;
  // unique id generate
  const timestamp = Date.now();
  const shortId = userId.toString().slice(-4);
  const transactionId =
    paymentMethod === "cod"
      ? `COD-${timestamp}-${shortId}`
      : `TXN-${timestamp}-${shortId}`;
  // at frist make a primery payment data
  const paymentData = {
    method: paymentMethod,
    status: "pending",
    amount: totalAmount,
    paymentId: `PAY-${timestamp}`,
    transactionId: transactionId,
  };

  const orderData = {
    user: userId,
    items,
    shippingAddress,
    subTotal,
    totalAmount,
    payment: paymentData,
  };
  const newOrder = await orderRepository.createOrder(orderData);
  // ----ccondition:1 COD (cash on Delivery)-----
  if (paymentMethod.toLowerCase() === "cod") {
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          newOrder,
          "Order placed successfully with Cash on Delivery."
        )
      );
  }
  // ----condition 2----
  const onlineMethod = ["stripe", "sslcommerz"];
  if (onlineMethod.includes(paymentMethod.toLowerCase())) {
    try {
      let paymentResponse;
      if (paymentMethod === "sslcommerz") {
        paymentResponse = await paymentService.initiateSSLCommerz(
          newOrder,
          req.user
        );
      } else {
        paymentResponse = await paymentService.initiatePayment(
          newOrder,
          paymentMethod
        );
      }

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            orderId: newOrder._id,
            paymentUrl: paymentResponse.url,
            gatewayReference: paymentResponse.gatewayReference,
          },
          "Redirecting to payment gateway..."
        )
      );
    } catch (error) {
      throw new ApiError(
        500,
        error.message ||
          "Payment gateway initialization failed. Please try again from order history."
      );
    }
  }
  throw new ApiError(400, "Invalid payment method selected.");
});
const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const status = req.query;
  if (status) {
    if (!validStatus.includes(status)) {
      throw new ApiError(400, "status in not valid ");
    }
    const order = await orderRepository.getUserOrders(userId, status);
    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order fetched successfully"));
  }
});
const updateOrderAndStatus = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { orderId } = req.params;
  const { status, reason } = req.query;
  if (!status) {
    throw new ApiError(400, "Status is required");
  }
  if (!validStatus.includes(status)) {
    throw new ApiError(400, "status in not valid ");
  }
  let updateOrder;
  switch (status) {
    case "delivered":
      const updateOrder = await orderRepository.deliverOrderAndDeductStock(
        orderId,
        userId
      );
    case "cancelled":
      if (!reason) {
        throw new ApiError(400, "Please provide a reason for cancellation");
      }
      updatedOrder = await orderRepository.cancelOrderWithSession();
      break;
    default:
      updateOrder = await orderRepository.updateOrderStatus(
        orderId,
        status,
        userId
      );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedOrder,
        `Order status successfully updated to ${status}`
      )
    );
});
// ====get single order=======
const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderRepository.getOrderById(orderId);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order detail fetched successfully"));
});
// ======get single oorder by order number----
const getOrderByOrderNum = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  if (!orderNumber) {
    throw new ApiError(404, "Order not found");
  }
  const order = await orderRepository.getOrderByOrderNumber(orderNumber);
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order found successfully"));
});
// Get Vendor Sales Report (Vendor Only)
export const updateOrderAndStatus = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { role, _id: userId } = req.user; // Assuming the logged-in user is the vendor

  if (!startDate || !endDate) {
    throw new ApiError(400, "Start date and End date are required");
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  let report;
  // 2. Role-Based Decision Making
  switch (role) {
    case "super-admin":
    case "admin":
      // Admin sees the global platform report
      report = await orderRepository.getSalesReport(start, end);
      break;

    case "manager":
      // Managers might see global report or a restricted one
      // (For now, let's give them global access like admin)
      report = await orderRepository.getSalesReport(start, end);
      break;

    case "vendor":
      // Vendors ONLY see their own product sales
      report = await orderRepository.getVendorSalesReport(userId, start, end);
      break;

    default:
      // Normal users or unknown roles are blocked
      throw new ApiError(
        403,
        "You do not have permission to access sales reports"
      );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        report,
        `${role.toUpperCase()} sales report generated successfully`
      )
    );
});
export {
  placeNewOrder,
  getUserOrders,
  updateOrderAndStatus,
  getOrderById,
  getOrderByOrderNum,
  getSalesReport,
};
