import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

export const chatModel = mongoose.model("Chat", chatSchema);
