const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/signup",
  validate([
    body("username").trim().isLength({ min: 3, max: 30 }),
    body("name").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
  ]),
  authController.signup
);

router.post(
  "/login",
  validate([
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ]),
  authController.login
);

router.post("/logout", authController.logout);

router.get("/me", auth, authController.checkAuthStatus);

module.exports = router;
