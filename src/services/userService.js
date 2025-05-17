const User = require("../models/User");

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (updateData.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error("Email already in use");
      }
    }

    Object.assign(user, updateData);
    await user.save();
    return this.sanitizeUser(user);
  }

  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}

module.exports = new UserService();
