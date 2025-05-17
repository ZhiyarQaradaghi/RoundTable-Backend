const authService = require("../services/authService");

class AuthController {
  async signup(req, res) {
    try {
      const { token, user } = await authService.signup(req.body);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
      res.status(201).json({ user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login(email, password);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
      res.json({ user });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req, res) {
    res.cookie("token", "", { maxAge: 0 });
    res.json({ message: "Logged out successfully" });
  }

  async checkAuthStatus(req, res) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
