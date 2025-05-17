const express = require("express");
const { body } = require("express-validator");
const discussionController = require("../controllers/discussionController");
const { auth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  auth,
  validate([
    body("title").trim().isLength({ min: 5, max: 100 }),
    body("description").trim().isLength({ min: 10, max: 500 }),
    body("type").isIn([
      "public",
      "private",
      "themed",
      "free talk",
      "queue based",
      "Queue Based",
      "Free Talk",
    ]),
    body("topic").optional().trim().isLength({ max: 50 }),
    body("maxParticipants").isInt({ min: 2, max: 50 }),
    body("startTime").optional().isISO8601(),
    body("endTime").optional().isISO8601(),
  ]),
  discussionController.createDiscussion
);

router.get("/", auth, discussionController.getDiscussions);
router.get("/:id", auth, discussionController.getDiscussion);
router.post("/:id/join", auth, discussionController.joinDiscussion);
router.post("/:id/leave", auth, discussionController.leaveDiscussion);
router.get("/:id/messages", auth, discussionController.getMessages);
router.post(
  "/:id/messages",
  auth,
  validate([body("content").trim().isLength({ min: 1, max: 1000 })]),
  discussionController.sendMessage
);
router.get("/:id/members", auth, discussionController.getMembers);

module.exports = router;
