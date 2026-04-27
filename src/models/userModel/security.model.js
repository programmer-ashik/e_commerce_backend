import { Schema, model } from "mongoose";
import crypto from "crypto";
const securitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One user has only one security profile
    },

    // Account Status & Verification
    verification: {
      isEmailVerified: { type: Boolean, default: false },
      isPhoneVerified: { type: Boolean, default: false },
      emailToken: String,
      emailTokenExpire: Date,
      phoneOTP: String,
      phoneOTPExpire: Date,
    },

    // Access Control
    status: {
      isActive: { type: Boolean, default: true },
      isBlocked: { type: Boolean, default: false },
      blockedReason: String,
      blockedAt: Date,
      blockedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Security Credentials Management
    auth: {
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpire: Date,
      emailVerificationToken: String,
      emailVerificationExpire: Date,
      lastLogin: Date,
      lastLoginIP: String,
    },

    // Device & Sessions History
    devices: [
      {
        deviceId: String,
        deviceName: String,
        browser: String,
        os: String,
        ipAddress: String,
        lastActive: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
      },
    ],
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// Index for faster token lookup
securitySchema.index({ "auth.passwordResetToken": 1 });
securitySchema.index({ "verification.emailToken": 1 });
// =========instance methods=========
securitySchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.auth.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.auth.passwordResetExpire = Date.now() + 10 * 60 * 1000; //10 minit
  return resetToken;
};
// email veriffications
securitySchema.methods.generateEmailVarificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.auth.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.auth.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; //24 hours
  return verificationToken;
};
// Check if password was changed after JWT issued
securitySchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.auth.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.auth.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export const Security = model("Security", securitySchema);
