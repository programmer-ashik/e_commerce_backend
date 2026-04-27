import asyncHandler from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
