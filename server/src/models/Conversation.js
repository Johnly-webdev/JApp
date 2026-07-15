import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String, trim: true }, // group name, ignored for 1:1
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // for groups
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

// Prevent duplicate 1:1 conversations between the same two users
conversationSchema.index({ participants: 1 });

export default mongoose.model("Conversation", conversationSchema);
