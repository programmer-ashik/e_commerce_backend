import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  const createdUser = user.toObject();
  delete createdUser.password;
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User register successfully please verify your email"
      )
    );
});
export const veryfyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and otp both are required");
  }
  const user = await authService.verifyEmail(email, otp);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Email verified successfully now you can login"
      )
    );
});
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password both are required");
  }
  const { user, accessToken, refreshToken } = await authService.loginUser(
    email,
    password
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  // confrim that password removed successfully
  const loggedInUser = user.toObject();
  delete loggedInUser.password;
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged successfully"
      )
    );
});
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  await authService.logoutUser(userId);
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logOut SuccessFully"));
});
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  const { accessToken, newRefreshToken } = await authService.refreshAccessToken(
    incommingRefreshToken
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access Token refreshed SuccessFully"
      )
    );
});
export const changepassword = asyncHandler(async (req, res) => {
  const userEmail = req.user?.email;
  const { currentPass, newpass } = req.body;
  await authService.resetPassword(userEmail, currentPass, newpass);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset link send to you email"));
});
export const resetPasswordConfrim = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  await authService.resetPasswordWithToken(token, newPassword);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset successfully. please login again"
      )
    );
});
