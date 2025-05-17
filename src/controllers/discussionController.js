const discussionService = require("../services/discussionService");
const { getIO } = require("../config/socket");

class DiscussionController {
  async createDiscussion(req, res) {
    try {
      const discussion = await discussionService.createDiscussion(
        req.body,
        req.user.id
      );
      res.status(201).json(discussion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDiscussions(req, res) {
    try {
      const discussions = await discussionService.getDiscussions(req.query);
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDiscussion(req, res) {
    try {
      const discussion = await discussionService.getDiscussionById(
        req.params.id
      );
      res.json(discussion);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async joinDiscussion(req, res) {
    try {
      const result = await discussionService.joinDiscussion(
        req.params.id,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async leaveDiscussion(req, res) {
    try {
      const discussion = await discussionService.leaveDiscussion(
        req.params.id,
        req.user.id
      );
      res.json(discussion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const { page } = req.query;
      const messages = await discussionService.getMessages(req.params.id, page);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMembers(req, res) {
    try {
      const members = await discussionService.getDiscussionMembers(
        req.params.id
      );
      res.json(members);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const message = await discussionService.createMessage(
        req.params.id,
        req.user.id,
        req.body.content
      );

      const io = getIO();
      if (io) {
        io.to(req.params.id).emit("receive_message", message);
      }

      res.status(201).json(message);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new DiscussionController();
