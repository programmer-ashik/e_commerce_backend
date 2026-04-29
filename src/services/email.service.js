import * as Brevo from "@getbrevo/brevo";
import { apiInstance } from "../config/mail.js";

export const sendVerificationEmail = async (email, otp) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "আপনার ওটিপি (OTP) কোড";
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Your verification code: ${otp}</h1>
        <p>You verification code will expired withen 5 min</p>
      </body>
    </html>`;
  sendSmtpEmail.sender = {
    name: "Ashik Shop",
    email: "no-reply@yourdomain.com",
  };
  sendSmtpEmail.to = [{ email: email }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully: " + JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Brevo Error:", error);
    throw error;
  }
};
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const sendSmtpEmail = new Brevo.sendSmtpEmail();
  sendSmtpEmail.subject = "Request for Password Reset";
  sendSmtpEmail.htmlContent = `
  <h1>Are you want to reset Password</h1>
  <p>Click to the link given below</p>
  <a href="${resetUrl}" style="background: blue; color: white; padding: 10px;>
  Reset password
  </a>
  `;
  sendSmtpEmail.sender = {
    name: "Ashik Shop support",
    email: "support@admin.com",
  };
  sendSmtpEmail.to = [{ email: email }];
  return await apiInstance.sendTransacEmail(sendSmtpEmail);
};
