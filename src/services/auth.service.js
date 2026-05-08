import redisClient from "../config/redis";
import { Security } from "../models/userModel/security.model";
import { userRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import * as mailServer from "../services/email.service.js";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";

export const registerUser = async (userData) => {
  const { email, fullName, username, password, role } = userData;
  const existedUser = await userRepository.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  const user = await userRepository.create({
    username,
    email,
    fullName,
    password,
    role,
  });
  const security = await Security.create({
    user: user._id,
  });
  user.security = security._id;
  await user.save();
  const opt = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.set(`email_verification:${user.email}`, opt, "EX", 300);
  await mailServer.sendVerificationEmail(user.email, opt);
  return user;
};

export const loginUser = async (email, password) => {
  const user = await userRepository.findByEmailWithPassword(email);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid crediantial");
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  await redisClient.set(
    `refresh_token:${user._id}`,
    refreshToken,
    "EX",
    process.env.REFRESH_TOKEN_EXPIRY_SECONDS
  );
  return { user, accessToken, refreshToken };
};
export const logoutUser = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // find in redis and remove user session
  await redisClient.del(`refresh_token:${userId}`);
  return user;
  // remove from cookie from controller
};
export const refreshAccessToken = async (incommingRefreshToken) => {
  try {
    const decodeToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // check token from redis
    const storedToken = await redisClient.get(
      `refresh_token:${decodeToken?._id}`
    );
    if (!storedToken || storedToken !== incommingRefreshToken) {
      throw new ApiError(401, "RefreshToken is expired or invalid");
    }
    // confirm the user have in the dab
    const user = await userRepository.findById(decodeToken._id);
    if (!user) {
      throw new ApiError(404, "User not found in db ");
    }
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    // put it into the redis
    await redisClient.set(
      `refresh_token:${user._id}`,
      newRefreshToken,
      "EX",
      10 * 24 * 60 * 60
    );
    return { accessToken, newRefreshToken };
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
};
export const resetPassword = async (userEmail, currentPass, newpass) => {
  const user = await userRepository.findByEmailWithPassword(userEmail);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPassValid = await user.isPasswordCorrect(currentPass);
  if (!isPassValid) {
    throw new ApiError(401, "Your current password is incorrect");
  }
  user.password = newpass;
  await user.save({ validateBeforeSave: false });
  // clear redis refreshtoken invalidations
  await redisClient.del(`refresh_token:${user?._id}`);
  return user;
};
export const forgotPassword = async (email) => {
  const user = await userRepository.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }
  // not we make a security token
  const resetToken = crypto.randomBytes(32).toString("hex");
  // not we set this token on redis for 15 minit
  await redisClient.set(
    `password_reset:${resetToken}`,
    user._id.toString(),
    "EX",
    900
  );
  // create a link for frontend
  const restUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  // send email by bravo
  await mailService.sendPasswordResetEmail(user.email, resetUrl);
  return true;
};
export const resetPasswordWithToken = async (token, newPassword) => {
  const userId = await redisClient.get(`password_reset:${token}`);
  if (!userId) {
    throw new ApiError(400, "User not found");
  }
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  // remove token from redis
  await redisClient.del(`password_reset:${token}`);
  // for security logout from all devices
  await redisClient.del(`refresh_token:${userId}`);
  return user;
};
export const verifyEmail = async (email, otp) => {
  //check otp from redis
  const storedOtp = await redisClient.get(`email_verification:${email}`);
  if (!storedOtp) {
    throw new ApiError(400, "OTP expired or invalid");
  }
  if (storedOtp !== otp) {
    throw new ApiError(400, "Incorrect OTP");
  }
  // find user and update email verified to true
  const user = await userRepository.findOne({ email }).populate("security");
  if (!user || !user.security) {
    throw new ApiError(404, "User or security profile not found");
  }
  const securityProfile = await Security.findById(user.security._id);
  securityProfile.verification.isEmailVerified = true;
  securityProfile.verification.emailToken = undefined;
  securityProfile.verification.emailTokenExpire = undefined;
  await securityProfile.save();
  await redisClient.del(`email_verification:${email}`);
  return user;
};
