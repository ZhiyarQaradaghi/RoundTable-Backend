const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Queue Based", "Free Talk", "queue", "free talk"],
      default: "Free Talk",
    },
    tags: {
      type: [String],
      default: [],
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 2,
      max: 100,
      default: 10,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "closed", "deleted"],
      default: "active",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    speakingQueue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Discussion = mongoose.model("Discussion", discussionSchema);

module.exports = Discussion;
