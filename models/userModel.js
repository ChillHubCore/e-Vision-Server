import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 255,
    },
    message: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 2047,
    },
    dateRead: Date,
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
    username: { type: String, required: true, minLength: 3, maxLength: 255 },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 255,
    },
    countryCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    isPhoneVerified: { type: Boolean, required: true, default: false },
    isCreator: { type: Boolean, default: false, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    watchList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    status: {
      type: [userStatusSchema],
      default: [],
    },
    notifications: {
      type: [notificationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);
export default User;
