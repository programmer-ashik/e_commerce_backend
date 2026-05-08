import { BrevoClient } from "@getbrevo/brevo";
import "dotenv/config"; // Ensure env variables are loaded

const apiInstance = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export { apiInstance };
