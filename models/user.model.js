import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, default: "0" },
  },
  { timestamps: true },
);

export const userModel = mongoose.model("User", userSchema);
