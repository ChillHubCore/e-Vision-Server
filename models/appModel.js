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
    taxRate: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      required: true,
      unique: true,
    },
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
        countryCode: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
          minLength: 3,
          maxLength: 255,
        },
        _id: false,
      },
      required: true,
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
