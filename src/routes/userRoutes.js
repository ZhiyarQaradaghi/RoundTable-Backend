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
    body("name").optional().trim().isLength({ min: 1, max: 50 }),
    body("bio").optional().trim().isLength({ max: 200 }),
    body("avatar").optional().trim().isURL(),
  ]),
  userController.updateProfile
);

module.exports = router;
