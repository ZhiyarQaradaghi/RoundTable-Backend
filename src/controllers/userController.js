const userService = require("../services/userService");

class UserController {
  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      console.log("Update profile request:", req.body);
      const allowedUpdates = ["name", "avatar", "bio"];
      const updateData = {};

      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const user = await userService.updateProfile(req.user.id, updateData);
      res.json(user);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
