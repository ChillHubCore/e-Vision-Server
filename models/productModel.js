import mongoose from "mongoose";
import { zeroEmptySpaceValidator } from "../validators/inputValidators.js";

const variantSchema = new mongoose.Schema(
  {
    images: { type: [String], required: true }, // Array of product images
    details: [
      {
        key: { type: String, required: true, minlength: 3, maxlength: 255 },
        value: { type: String, required: true, minlength: 3, maxlength: 255 },
      },
    ], // Array of variant attributes, e.g., "color", "size", "material"
    SKU: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return zeroEmptySpaceValidator.safeParse(value).success;
        },
        message: "SKU should not contain any empty spaces.",
      },
    }, // Stock Keeping Unit
    price: {
      type: {
        regularPrice: { type: Number, required: true }, // Regular price
        discountedPrice: { type: Number, required: false, default: false }, // Discounted price if available
        _id: false,
      },
      required: true,
    },
    inStock: { type: Number, required: true },
    soldAmount: { type: Number, required: true, default: 0 },
    availability: {
      type: Boolean,
      required: true,
      enum: [true, false],
    },
    rating: { type: Number, required: true, default: 0 }, // Average review rating
    reviews: [
      {
        rating: { type: Number, required: true, min: 0, max: 5 },
        comment: { type: String, minlength: 3, maxlength: 255 },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who submitted the review
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  {
    autoCreate: true,
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    metaDescription: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    metaTags: {
      type: [String],
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    name: { type: String, required: true, minlength: 3, maxlength: 255 },
    slug: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 1023,
      validate: {
        validator: function (value) {
          return zeroEmptySpaceValidator.safeParse(value).success;
        },
        message: "Slug should not contain any empty spaces.",
      },
    },
    brand: { type: String, required: true, minlength: 3, maxlength: 255 },
    category: { type: String, required: true, minlength: 3, maxlength: 255 },
    description: {
      type: {
        short: { type: String, required: true, minlength: 3, maxlength: 255 }, // Short product description
        full: { type: String, required: true, minlength: 50, maxlength: 10000 }, // Full product description
      },
      required: true,
    },
    variants: { type: [variantSchema], required: true }, // Array of product variants
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Linked related products
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedDetails: {
      type: [
        {
          key: { type: String, required: true, minlength: 3, maxlength: 255 },
          value: { type: String, required: true, minlength: 3, maxlength: 255 },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
