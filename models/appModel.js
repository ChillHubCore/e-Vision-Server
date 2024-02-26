import mongoose from "mongoose";

const appSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minLength: 3, maxLength: 255 },
    primaryCurrency: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    extraCurrenciesSupported: {
      type: [{ type: String, minLength: 3, maxLength: 255 }],
      required: true,
      default: [],
    },
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
    userStatus: {
      type: [{ type: String, minLength: 3, maxLength: 255 }],
      required: true,
      default: [],
    },
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
    postalOptions: {
      type: [{ type: String, minLength: 3, maxLength: 255 }],
      required: true,
      default: [],
    },
    paymentOptions: {
      type: [{ type: String, minLength: 3, maxLength: 255 }],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const App = mongoose.model("App", appSchema);
export default App;
