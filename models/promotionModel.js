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
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        _id: false,
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
        default: 0,
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
        default: 0,
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
        },
        maxTimesToUse: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    },
    percentageDiscount: {
      active: {
        type: Boolean,
        required: true,
        default: false,
      },
      percentage: {
        default: 0,
        type: Number,
        required: true,
        validate: {
          validator: function (value) {
            // Ensure percentage is less than 100
            return value < 100;
          },
          message: "percentage must be less than 100",
        },
      },
    },
    fixedDiscount: {
      active: {
        type: Boolean,
        required: true,
        default: false,
      },
      price: {
        default: 0,
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
