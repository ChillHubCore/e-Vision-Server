import mongoose from "mongoose";
import {
  emailValidator,
  phoneValidator,
} from "../validators/userValidators.js";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    message: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 2047,
    },
    isMessageRead: { type: Boolean, default: false, required: true },
  },
  {
    autoCreate: true,
  },
  {
    timestamps: true,
  },
);

const userStatusSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, minLength: 3, maxLength: 255 },
    description: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 2047,
    },
    date: Date,
  },
  {
    timestamps: true,
  },
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: 3, maxLength: 255 },
    lastName: { type: String, required: true, minLength: 3, maxLength: 255 },
    username: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 255,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 255,
      validate: {
        validator: function (value) {
          return emailValidator.safeParse(value).success;
        },
        message: "Invalid email format.",
      },
    },
    countryCode: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: false,
      default: "https://via.placeholder.com/150",
    },
    birthDate: { type: Date, required: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return phoneValidator.safeParse(value).success;
        },
      },
    },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    isPhoneVerified: { type: Boolean, required: true, default: false },
    isCreator: { type: Boolean, default: false, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    role: {
      type: {
        label: String,
        value: Number,
        _id: false,
      },
      required: true,
      enum: [
        { label: "User", value: 1 },
        { label: "TeamMember", value: 2 },
        { label: "Support", value: 3 },
        { label: "Moderator", value: 4 },
      ],
      default: { label: "User", value: 1 },
    },
    loyaltyPoints: { type: Number, default: 0, required: true },
    shopTokenBalance: { type: Number, default: 0, required: true },
    watchList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    status: {
      type: [userStatusSchema],
      required: false,
    },
    notifications: {
      type: [notificationSchema],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);
export default User;
