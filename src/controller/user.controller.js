import {
  deleteCloudinary,
  uploadOnCloudinary,
} from "../config/cloudinary.config";
import { userRepository } from "../repositories/user.repository";
import { asyncHandler } from "../utils/asyncHandler";

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avaterLocalPath = req.file?.path;
  const userId = req.user?._id;
  if (!avaterLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const uploadResponse = await uploadOnCloudinary(avaterLocalPath);
  if (!uploadResponse?.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }
  //   if photo alreday have in db. first have to delete
  const oldPublicId = user.profile?.avatar?.publicId;
  if (oldPublicId) {
    await deleteCloudinary(oldPublicId);
  }
  const user = await userRepository.updateById(userId, {
    "avatar.profile.avatar": {
      url: uploadResponse.url,
      publicId: uploadResponse.public_id,
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});
const userProfileUpdate = asyncHandler(async (req, res) => {
  const { bio, gender, dob } = req.body;
  const file = req.file;
  const userId = req.user?._id;
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  //   now make a empty object
  const updateFields = {};
  if (bio) updateFields["profile.bio"] = bio;
  if (gender) updateFields["profile.gender"] = gender;
  if (dob) updateFields["profile.dob"] = dob;
  if (file) {
    const avatarLocalPath = file.path;
    const uploadResponse = await uploadOnCloudinary(avatarLocalPath);
    if (uploadResponse?.url) {
      // delete old avatar
      if (user.profile?.avatar?.publicId) {
        await deleteCloudinary(user.profile?.avatar?.publicId);
      }
      //   now update
      updateFields["profile.avatar"] = {
        url: uploadResponse?.url,
        publicId: uploadResponse?.publicId,
      };
    }
  }
  //   check is updateFields is empty
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }
  const updateUser = await userRepository.updateById(userId, updateFields);
  return res
    .status(200)
    .json(new ApiResponse(200, { updateUser }, "profile update successfully"));
});
export { updateUserAvatar, userProfileUpdate };
