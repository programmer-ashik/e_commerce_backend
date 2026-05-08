import SSLCommerzPayment from "sslcommerz-lts";
import { ApiError } from "../utils/ApiError";

const initiateSSLCommerz = async (order, user) => {
  const data = {
    total_amount: order.totalAmount,
    currency: "BDT",
    tran_id: order.payment.transactionId, // তোমার জেনারেট করা ইউনিক আইডি
    success_url: process.env.SSL_SUCCESS_URL,
    fail_url: process.env.SSL_FAIL_URL,
    cancel_url: process.env.SSL_CANCEL_URL,
    ipn_url: "http://localhost:5000/api/v1/payments/ipn",
    shipping_method: "Courier",
    product_name: "Order items",
    product_category: "E-commerce",
    product_profile: "general",
    cus_name: user.name || "Customer Name",
    cus_email: user.email,
    cus_add1: order.shippingAddress.address,
    cus_city: order.shippingAddress.city,
    cus_postcode: order.shippingAddress.postalCode || "1000",
    cus_country: "Bangladesh",
    cus_phone: order.shippingAddress.phone || "017XXXXXXXX",
    ship_name: user.name,
    ship_add1: order.shippingAddress.address,
    ship_city: order.shippingAddress.city,
    ship_state: order.shippingAddress.city,
    ship_postcode: order.shippingAddress.postalCode,
    ship_country: "Bangladesh",
  };
  const sslcz = new SSLCommerzPayment(
    process.env.SSL_STORE_ID,
    process.env.SSL_STORE_PASS,
    process.env.SSL_IS_LIVE === "true"
  );
  try {
    const apiResponse = await sslcz.init(data);
    if (apiResponse?.GatewayPageURL) {
      return {
        url: apiResponse.GatewayPageURL,
        gatewayReference: apiResponse.sessionkey,
      };
    } else {
      throw new ApiError(500, "SSLCommerz session creation failed");
    }
  } catch (error) {
    throw new ApiError(500, err.message || "SSLCommerz Initialization Error");
  }
};
export const paymentService = { initiateSSLCommerz };
