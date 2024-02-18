import mongoose from "mongoose";

const detailSchema = new mongoose.Schema({
  key: { type: String, required: true, minlength: 3, maxlength: 255 },
  value: { type: String, required: true, minlength: 3, maxlength: 255 },
});

const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, minlength: 3, maxlength: 255 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who submitted the review
  },
  { timestamps: true },
);

const variantSchema = new mongoose.Schema({
  images: { type: [String], required: true }, // Array of product images
  details: [detailSchema], // Array of variant attributes, e.g., "color", "size", "material"
  SKU: { type: String, required: true, unique: true }, // Stock Keeping Unit
  price: {
    type: {
      regularPrice: { type: Number, required: true }, // Regular price
      discountedPrice: Number, // Discounted price if available
      specialOffers: [
        {
          name: String, // Description of special offers
          price: Number, // Price for the special offer
        },
      ],
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
  reviews: [reviewSchema],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 255 },
    slug: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 1023,
    },
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
      type: [detailSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
