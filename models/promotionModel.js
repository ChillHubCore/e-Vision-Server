import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    promotionIdentifier: {
      type: String,
      required: true,
      unique: true,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    minTotalOrder: {
      acitve: {
        type: Boolean,
        required: true,
        default: false,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    accessibleRoles: {
      type: [String],
      required: true,
    },
    maximumDiscount: {
      acitve: {
        type: Boolean,
        required: true,
        default: false,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    activeFrom: {
      type: Date,
      required: true,
    },
    activeUntil: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Ensure activeUntil is after activeFrom
          return this.activeFrom < value;
        },
        message: "active Until must be after activeFrom",
      },
    },
    usageCap: {
      type: {
        isCaped: {
          type: Boolean,
          required: true,
          default: false,
        },
        timesUsed: {
          type: Number,
          required: true,
          default: 0,
          validate: {
            validator: function (value) {
              // Ensure timesUsed is less than maxTimesToUse
              return this.usageCap.maxTimesToUse > value;
            },
            message: "times Used must be less than maxTimesToUse",
          },
        },
        maxTimesToUse: {
          type: Number,
          required: true,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
