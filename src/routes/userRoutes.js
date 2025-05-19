const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { auth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/profile", auth, userController.getProfile);

router.put(
  "/profile",
  auth,
  validate([
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Name must be between 1 and 50 characters"),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Bio must not exceed 200 characters"),
    body("avatar")
      .optional()
      .trim()
      .custom((value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error("Invalid URL format");
        }
      }),
  ]),
  userController.updateProfile
);

module.exports = router;
