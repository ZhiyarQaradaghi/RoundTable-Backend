const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
