import Conversation from "../models/Conversation.js";

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name username avatarUrl isOnline lastSeen")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

// Get existing 1:1 conversation or create a new one
export const startConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (userId === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot start a conversation with yourself" });
    }

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, userId], $size: 2 },
    })
      .populate("participants", "name username avatarUrl isOnline lastSeen")
      .populate("lastMessage");

    if (!conversation) {
      conversation = await Conversation.create({
        isGroup: false,
        participants: [req.user._id, userId],
      });
      conversation = await conversation.populate(
        "participants",
        "name username avatarUrl isOnline lastSeen"
      );
    }

    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const { name, participantIds } = req.body;
    if (!name || !participantIds || participantIds.length < 2) {
      return res
        .status(400)
        .json({ message: "Group name and at least 2 other participants are required" });
    }

    const conversation = await Conversation.create({
      isGroup: true,
      name,
      participants: [req.user._id, ...participantIds],
      admins: [req.user._id],
    });

    const populated = await conversation.populate(
      "participants",
      "name username avatarUrl isOnline lastSeen"
    );

    res.status(201).json({ conversation: populated });
  } catch (err) {
    next(err);
  }
};
