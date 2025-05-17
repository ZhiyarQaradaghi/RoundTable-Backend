const authService = require("../services/authService");

class AuthController {
  async signup(req, res) {
    try {
      const { token, user } = await authService.signup(req.body);
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      };

      res.cookie("token", token, cookieOptions);
      res.status(201).json({ user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login(email, password);
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      };

      res.cookie("token", token, cookieOptions);
      res.json({ user });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req, res) {
    const cookieOptions = {
      maxAge: 0,
      path: "/",
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.domain = ".onrender.com";
    }

    res.cookie("token", "", cookieOptions);
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
