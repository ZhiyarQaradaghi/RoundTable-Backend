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
      const allowedUpdates = ["name", "avatar", "bio"];
      const updateData = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updateData[key] = req.body[key];
        }
      });

      const user = await userService.updateProfile(req.user.id, updateData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
