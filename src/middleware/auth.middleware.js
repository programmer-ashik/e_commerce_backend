import { User } from "../models/userModel/User.models";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(400, "unauthorize request Require token");
    }
    const decodeToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodeToken._id);
    if (!user) {
      throw new ApiError(404, "user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, "Invalit Access Token");
  }
});

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role: ${req.user.role} is not allowed to access this resource`
      );
    }
    next();
  };
};
export { verifyJWT, authorizeRole };
