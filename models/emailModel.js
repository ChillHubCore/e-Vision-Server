import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    attachments: {
      type: [String],
    },
    readFlag: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Email = mongoose.model("Email", emailSchema);

export default Email;
