import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

// Maps a userId to the set of socket ids they're currently connected with
// (a user can have multiple tabs/devices open at once).
const onlineUsers = new Map();

const addSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeSocket = (userId, socketId) => {
  const set = onlineUsers.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) onlineUsers.delete(userId);
};

export const initSockets = (io) => {
  // Authenticate every socket connection using the same JWT as the REST API
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const { userId } = socket;
    addSocket(userId, socket.id);

    // Join a personal room so we can target this user directly regardless of
    // which conversation-specific rooms they've joined.
    socket.join(userId);

    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("userOnline", { userId });

    socket.on("joinRoom", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("leaveRoom", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("typing", { conversationId, userId });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(conversationId).emit("stopTyping", { conversationId, userId });
    });

    socket.on("sendMessage", async (payload, callback) => {
      try {
        const { conversationId, text, replyTo, attachments } = payload;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => p.equals(userId))) {
          return callback?.({ error: "Not a participant of this conversation" });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text,
          replyTo: replyTo || null,
          attachments: attachments || [],
          deliveredTo: [userId],
          seenBy: [userId],
        });

        conversation.lastMessage = message._id;
        await conversation.save();

        const populated = await message.populate("sender", "name username avatarUrl");

        io.to(conversationId).emit("receiveMessage", populated);
        callback?.({ message: populated });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    socket.on("messageDelivered", async ({ messageId }) => {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { deliveredTo: userId } },
        { new: true }
      );
      if (message) {
        io.to(String(message.conversation)).emit("messageDelivered", { messageId, userId });
      }
    });

    socket.on("messageSeen", async ({ messageId }) => {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { seenBy: userId } },
        { new: true }
      );
      if (message) {
        io.to(String(message.conversation)).emit("messageSeen", { messageId, userId });
      }
    });

    socket.on("disconnect", async () => {
      removeSocket(userId, socket.id);
      // Only mark the user offline once ALL of their sockets are gone
      if (!onlineUsers.has(userId)) {
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
        io.emit("userOffline", { userId, lastSeen: new Date() });
      }
    });
  });
};
