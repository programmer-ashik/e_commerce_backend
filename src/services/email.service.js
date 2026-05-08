import { apiInstance } from "../config/mail.js";

export const sendVerificationEmail = async (email, otp) => {
  try {
    const data = await apiInstance.transactionalEmails.sendTransacEmail({
      subject: "আপনার ওটিপি (OTP) কোড",
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
              <h1>Your verification code: <span style="color: blue;">${otp}</span></h1>
              <p>Your verification code will expire within 5 minutes.</p>
            </div>
          </body>
        </html>`,
      sender: {
        name: "Ashik Shop",
        email: "no-reply@yourdomain.com", // Must be a verified sender in Brevo
      },
      to: [{ email: email }],
    });

    console.log("Email sent successfully:", data.body);
    return data;
  } catch (error) {
    console.error("Brevo Error:", error.response?.body || error.message);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const payload = {
    subject: "Request for Password Reset",
    htmlContent: `
      <h1>Do you want to reset your Password?</h1>
      <p>Click the link below:</p>
      <a href="${resetUrl}" style="background: blue; color: white; padding: 10px; text-decoration: none;">
        Reset password
      </a>`,
    sender: {
      name: "Ashik Shop Support",
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: email }],
  };

  return await apiInstance.transactionalEmails.sendTransacEmail(payload);
};
