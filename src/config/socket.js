const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Discussion = require("../models/Discussion");
const { Server } = require("socket.io");

let ioInstance = null;

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://round-table-gilt.vercel.app",
        "http://127.0.0.1:5173",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.cookie
          ?.split(";")
          .find((c) => c.trim().startsWith("token="))
          ?.split("=")[1];

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });

    socket.on("join_discussion", async (discussionId) => {
      try {
        socket.join(discussionId);

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) return;

        const isAlreadyParticipant = discussion.participants.some((id) =>
          id.equals(socket.user._id)
        );

        if (!isAlreadyParticipant) {
          discussion.participants.push(socket.user._id);
          await discussion.save();
        }

        await discussion.populate("participants", "username name avatar");
        io.to(discussionId).emit(
          "participants_updated",
          discussion.participants
        );
      } catch (error) {
        console.error("Error in join_discussion:", error);
      }
    });

    socket.on("leave_discussion", async (discussionId) => {
      try {
        socket.leave(discussionId);

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) return;

        discussion.participants = discussion.participants.filter(
          (id) => !id.equals(socket.user._id)
        );

        discussion.speakingQueue = discussion.speakingQueue.filter(
          (id) => !id.equals(socket.user._id)
        );

        await discussion.save();
        await discussion.populate("participants", "username name avatar");
        await discussion.populate("speakingQueue", "username name avatar");

        io.to(discussionId).emit(
          "participants_updated",
          discussion.participants
        );
        io.to(discussionId).emit(
          "speaking_queue_updated",
          discussion.speakingQueue
        );
        io.to(discussionId).emit("member_left", {
          discussionId,
          userId: socket.user._id,
        });
      } catch (error) {
        console.error("Error in leave_discussion:", error);
      }
    });

    socket.on("join_speaking_queue", async ({ discussionId }) => {
      try {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
          console.error(
            `Discussion ${discussionId} not found for join_speaking_queue.`
          );
          return;
        }

        if (discussion.type && discussion.type.toLowerCase() === "free talk") {
          await discussion.populate("speakingQueue", "username name avatar");
          const populatedQueue = discussion.speakingQueue.filter(
            (speaker) => speaker !== null
          );
          io.to(discussionId).emit("speaking_queue_updated", populatedQueue);
          return;
        }

        const userObjectId = socket.user._id;

        const isAlreadyInQueue = discussion.speakingQueue.some((id) =>
          id.equals(userObjectId)
        );

        if (!isAlreadyInQueue) {
          discussion.speakingQueue.push(userObjectId);
          await discussion.save();
        }

        await discussion.populate("speakingQueue", "username name avatar");
        const populatedQueueAfterAdd = discussion.speakingQueue.filter(
          (speaker) => speaker !== null
        );

        io.to(discussionId).emit(
          "speaking_queue_updated",
          populatedQueueAfterAdd
        );
      } catch (error) {
        console.error("Error joining speaking queue:", error);
      }
    });

    socket.on("leave_speaking_queue", async ({ discussionId }) => {
      try {
        const discussion = await Discussion.findById(discussionId);
        const initialQueueLength = discussion.speakingQueue.length;
        discussion.speakingQueue = discussion.speakingQueue.filter(
          (id) => !id.equals(socket.user._id)
        );

        if (discussion.speakingQueue.length < initialQueueLength) {
          await discussion.save();
          await discussion.populate("speakingQueue", "username name avatar");
          io.to(discussionId).emit(
            "speaking_queue_updated",
            discussion.speakingQueue
          );
        }
      } catch (error) {
        console.error("Error leaving speaking queue:", error);
      }
    });
  });

  return io;
};

const getIO = () => ioInstance;

module.exports = { setupSocket, getIO };
