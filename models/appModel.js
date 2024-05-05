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
      type: [{ type: String, enum: ["Card-To-Card"] }],
    },
    CardToCard: {
      type: [
        {
          cardNumber: {
            type: String,
            required: true,
            unique: true,
          },
          cardShabaNumber: {
            type: String,
            required: true,
            unique: true,
          },
          cardOwner: {
            type: String,
            required: true,
          },
          available: {
            type: Boolean,
            required: true,
          },
          _id: false,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

const App = mongoose.model("App", appSchema);
export default App;
