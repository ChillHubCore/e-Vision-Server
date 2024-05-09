import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["email", "phone", "telegram"],
    },
    code: { type: String, required: true, minLength: 3, maxLength: 255 },
    expiresAt: { type: Date, default: Date.now, expires: 180 }, // Set expiration time to 3 minutes (180 seconds)
  },
  {
    timestamps: true,
  },
);

const VerificationCode = mongoose.model(
  "VerificationCode",
  verificationCodeSchema,
);

export default VerificationCode;
