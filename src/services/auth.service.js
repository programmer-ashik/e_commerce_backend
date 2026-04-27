import { Security } from "../models/userModel/security.model";
import { userRepository } from "../repositories/user.repository";

export const registerUser = async (userDate) => {
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
  return user;
};
