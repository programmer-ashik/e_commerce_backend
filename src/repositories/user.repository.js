import { User } from "../models/userModel/User.models";
import BaseRepository from "./base.repository";

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }
  // find by email and security data
  async findUserWithSecurity(email) {
    return await this.model.findOne({ email }).populate("security");
  }
  //   user data with password
  async findByEmailWithPassword(email) {
    return await this.model.findOne({ email }).select("+password");
  }
}
export const userRepository = new UserRepository();
