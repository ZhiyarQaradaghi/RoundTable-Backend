const Discussion = require("../models/Discussion");
const Message = require("../models/Message");

class DiscussionService {
  async createDiscussion(discussionData, userId) {
    const discussion = await Discussion.create({
      ...discussionData,
      creator: userId,
      participants: [userId],
    });
    return discussion.populate("creator", "username name avatar");
  }

  async getDiscussions(filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const {
      type,
      status,
      sortBy = "createdAt",
      order = "desc",
      search,
      topic,
    } = filters;

    let query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = "active";
    }

    if (type && type !== "") {
      query.type = type;
    }

    if (topic && topic !== "") {
      query.topic = topic;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    try {
      const count = await Discussion.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      const discussionDocs = await Discussion.find(query)
        .populate("creator", "username name avatar")
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const discussions = discussionDocs.map((doc) => ({
        ...doc.toObject(),
        currentParticipants: doc.participants.length,
      }));

      return {
        discussions,
        totalPages,
        currentPage: page,
        totalDiscussions: count,
      };
    } catch (error) {
      console.error("Error fetching discussions:", error);
      throw new Error("Failed to retrieve discussions.");
    }
  }

  async getDiscussionById(id) {
    const discussion = await Discussion.findById(id)
      .populate("creator", "username name avatar")
      .populate("participants", "username name avatar")
      .populate("speakingQueue", "username name avatar");

    if (!discussion) {
      throw new Error("Discussion not found");
    }

    const discussionObject = discussion.toObject();
    discussionObject.currentParticipants = discussion.participants.length;

    if (
      discussionObject.type &&
      discussionObject.type.toLowerCase() === "free talk"
    ) {
      discussionObject.speakingQueue = [];
    }
    return discussionObject;
  }

  async joinDiscussion(discussionId, userId) {
    const discussion = await Discussion.findById(discussionId).populate(
      "participants",
      "username name avatar"
    );

    if (!discussion) {
      throw new Error("Discussion not found");
    }

    if (discussion.participants.length >= discussion.maxParticipants) {
      throw new Error("Discussion is full");
    }

    if (!discussion.participants.some((p) => p._id.toString() === userId)) {
      discussion.participants.push(userId);
      await discussion.save();
      await discussion.populate("participants", "username name avatar");
    }

    await discussion.populate("creator", "username name avatar");
    await discussion.populate("speakingQueue", "username name avatar");

    return {
      ...discussion.toObject(),
      currentParticipants: discussion.participants.length,
    };
  }

  async leaveDiscussion(discussionId, userId) {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      throw new Error("Discussion not found");
    }

    const initialParticipantCount = discussion.participants.length;
    discussion.participants = discussion.participants.filter(
      (participantId) => participantId.toString() !== userId.toString()
    );

    // Remove user from speakingQueue as well
    discussion.speakingQueue = discussion.speakingQueue.filter(
      (queueId) => queueId.toString() !== userId.toString()
    );

    if (
      discussion.participants.length < initialParticipantCount ||
      discussion.speakingQueue.length < initialParticipantCount
    ) {
      await discussion.save();
    }

    await discussion.populate("participants", "username name avatar");
    await discussion.populate("creator", "username name avatar");
    await discussion.populate("speakingQueue", "username name avatar");

    return {
      ...discussion.toObject(),
      currentParticipants: discussion.participants.length,
    };
  }

  async getDiscussionMembers(discussionId) {
    const discussion = await Discussion.findById(discussionId).populate(
      "participants",
      "username name avatar"
    );
    if (!discussion) {
      throw new Error("Discussion not found");
    }
    return discussion.participants;
  }

  async getMessages(discussionId, page = 1, limit = 20) {
    const totalMessages = await Message.countDocuments({
      discussion: discussionId,
    });
    const messages = await Message.find({ discussion: discussionId })
      .populate("sender", "username name avatar")
      .sort("createdAt")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalMessages / limit);

    return {
      messages,
      totalPages,
      currentPage: parseInt(page),
    };
  }

  async createMessage(discussionId, userId, content) {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      throw new Error("Discussion not found");
    }

    if (!discussion.participants.includes(userId)) {
      throw new Error("You are not a participant in this discussion");
    }

    const message = await Message.create({
      discussion: discussionId,
      sender: userId,
      content,
      type: "text",
    });

    const populatedMessage = await message.populate(
      "sender",
      "username name avatar"
    );
    return populatedMessage.toObject();
  }
}

module.exports = new DiscussionService();
