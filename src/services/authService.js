const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  async signup(userData) {
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new Error("Email already registered");
      }
      throw new Error("Username already taken");
    }

    const user = await User.create(userData);
    return this.generateToken(user);
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No account found with this email");
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    return this.generateToken(user);
  }

  generateToken(user) {
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    return { token, user: this.sanitizeUser(user) };
  }

  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
