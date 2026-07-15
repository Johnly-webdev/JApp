import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { before, limit = 30 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some((p) => p.equals(req.user._id))) {
      return res.status(403).json({ message: "Not a participant of this conversation" });
    }

    const query = {
      conversation: conversationId,
      deletedFor: { $ne: req.user._id },
    };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("sender", "name username avatarUrl")
      .populate("replyTo");

    res.json({ messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

// REST fallback for sending a message (primary path is Socket.IO — see sockets/index.js)
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, replyTo, attachments } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some((p) => p.equals(req.user._id))) {
      return res.status(403).json({ message: "Not a participant of this conversation" });
    }
    if (!text && !(attachments && attachments.length)) {
      return res.status(400).json({ message: "Message must have text or an attachment" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      replyTo: replyTo || null,
      attachments: attachments || [],
      deliveredTo: [req.user._id],
      seenBy: [req.user._id],
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populated = await message.populate("sender", "name username avatarUrl");
    res.status(201).json({ message: populated });
  } catch (err) {
    next(err);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { forEveryone } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (forEveryone) {
      if (!message.sender.equals(req.user._id)) {
        return res.status(403).json({ message: "Only the sender can delete for everyone" });
      }
      message.isDeletedForEveryone = true;
      message.text = "";
      message.attachments = [];
    } else {
      message.deletedFor.push(req.user._id);
    }

    await message.save();
    res.json({ message });
  } catch (err) {
    next(err);
  }
};
