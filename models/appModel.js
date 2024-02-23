import mongoose from "mongoose";

const appSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minLength: 3, maxLength: 255 },
    description: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 2047,
    },
    logo: {
      type: String,
      required: true,
    },

    version: { type: String, required: true, minLength: 3, maxLength: 255 },
    userStatus: { type: [{ type: String, minLength: 3, maxLength: 255 }] },
    contactAddresses: {
      type: {
        physical: {
          type: String,
          required: true,
          minLength: 3,
          maxLength: 255,
        },
        email: {
          type: String,
          required: true,
          minLength: 3,
          maxLength: 255,
        },
        phone: {
          type: String,
          required: true,
          minLength: 3,
          maxLength: 255,
        },
        postalCode: {
          type: String,
          required: true,
          minLength: 3,
          maxLength: 255,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

const App = mongoose.model("App", appSchema);
export default App;
