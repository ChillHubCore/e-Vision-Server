import mongoose from "mongoose";

// Define the Variant Schema
const variantSchema = new mongoose.Schema({
  images: [{ type: String, required: true }], // Array of product images
  details: [{ key: String, value: String }], // Array of variant attributes, e.g., "color", "size", "material"
  SKU: { type: String, required: true, unique: true }, // Stock Keeping Unit
  price: {
    regularPrice: { type: Number, required: true }, // Regular price
    discountedPrice: { type: Number }, // Discounted price if available
    specialOffers: [
      {
        type: String, // Description of special offers
        price: { type: Number }, // Price for the special offer
      },
    ],
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
      rating: { type: Number, required: true },
      comment: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who submitted the review
      createdAt: { type: Date, required: true, default: Date.now },
      updatedAt: { type: Date, required: true, default: Date.now },
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: {
      short: { type: String, required: true }, // Short product description
      detailed: { type: String, required: true }, // Detailed product description
      techSpecs: { type: String, required: true }, // Technical specifications
    },
    variants: [{ type: variantSchema }], // Array of product variants
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Linked related products
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
