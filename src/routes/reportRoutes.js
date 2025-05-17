const express = require("express");
const { body } = require("express-validator");
const reportController = require("../controllers/reportController");
const { auth, checkRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  auth,
  validate([
    body("reportedUser").optional().isMongoId(),
    body("discussion").optional().isMongoId(),
    body("category").isIn(["harassment", "spam", "inappropriate", "other"]),
    body("description").trim().isLength({ min: 1, max: 500 }),
  ]),
  reportController.createReport
);

router.get("/", auth, reportController.getReports);

router.patch(
  "/:id/status",
  auth,
  checkRole(["admin", "moderator"]),
  validate([body("status").isIn(["resolved", "rejected"])]),
  reportController.updateReportStatus
);

module.exports = router;
