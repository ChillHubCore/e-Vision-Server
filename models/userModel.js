import mongoose from "mongoose";

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
    phone: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 255,
    },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    isPhoneVerified: { type: Boolean, required: true, default: false },
    isCreator: { type: Boolean, default: false, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    addresses: [
      {
        type: mongoose.Schema.Types.Object,
        properties: {
          address: {
            type: String,
            minLength: 5,
            maxLength: 255,
            trim: true,
          },
          city: {
            type: String,
            minLength: 2,
            maxLength: 255,
            trim: true,
          },
          state: {
            type: String,
            minLength: 2,
            maxLength: 2,
            trim: true,
          },
          zipCode: {
            type: String,
            minLength: 5,
            maxLength: 10,
            trim: true,
          },
          isPrimary: {
            type: Boolean,
            default: false,
          },
        },
      },
    ],
    watchList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);
export default User;
