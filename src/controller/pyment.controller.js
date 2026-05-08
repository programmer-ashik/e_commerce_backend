import { orderRepository } from "../repositories/order.repository";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const paymentSuccess = asyncHandler(async (req, res) => {
  const { tran_id, amount, card_type, bank_tran_id } = req.body;
  const order = await orderRepository.getOrderByTransactionId(tran_id);
  if (!order) {
    throw new ApiError(404, "Order not found with this transaction ID");
  }
  if (order.totalAmount.toString() !== amount.toString()) {
    throw new ApiError(400, "Amount mismatch! potential fraud detected");
  }
  const updateOrder = await orderRepository.updatePaymentStatus(order._id, {
    status: "completed",
    transactionId: tran_id,
    paymentDetails: {
      card_type,
      bank_tran_id,
      val_id: req.body.val_id,
    },
  });
  return res.redirect(
    `${process.env.CLIENT_URL}/payment/success?orderId=${order._id}`
  );
});
const paymentFailed = asyncHandler(async (req, res) => {
  const { tran_id } = req.body;
  const order = await orderRepository.getOrderByTransactionId(tran_id);
  if (order) {
    await orderRepository.updatePaymentStatus(order._id, {
      status: "failed",
      transactionId: tran_id,
      paymentDetails: {
        error: req.body.error || "Payment failed at gateway",
        status: req.body.status,
      },
    });
    return res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
  }
});
export { paymentSuccess, paymentFailed };
