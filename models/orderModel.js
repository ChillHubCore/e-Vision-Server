import mongoose from "mongoose";

/**
 * Represents the schema for an order in the e-commerce system.
 *
 * @typedef {Object} OrderSchema
 * @property {Array} cartItems - The items in the order's cart.
 * @property {Object} shippingAddress - The shipping address for the order.
 * @property {string} status - The status of the order.
 * @property {string} notes - Additional notes for the order.
 * @property {string} trackingNumber - The tracking number for the order.
 * @property {Date} estimatedDeliveryDate - The estimated delivery date for the order.
 * @property {Date} actualDeliveryDate - The actual delivery date for the order.
 * @property {string} paymentMethod - The payment method for the order.
 * @property {Object} paymentResult - The payment result for the order.
 * @property {number} itemsPrice - The total price of the cart items.
 * @property {number} taxPrice - The tax price for the order.
 * @property {Object} maker - The user who made the order.
 * @property {boolean} isPaid - Indicates if the order has been paid.
 * @property {Date} paidAt - The date when the order was paid.
 * @property {boolean} isDelivered - Indicates if the order has been delivered.
 * @property {boolean} isRecived - Indicates if the order has been received.
 * @property {Date} deliveredAt - The date when the order was delivered.
 * @property {Date} createdAt - The date when the order was created.
 * @property {Date} updatedAt - The date when the order was last updated.
 */
const orderSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        quantity: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product.variants",
          required: true,
        },
      },
    ],
    shippingAddress: {
      receiverName: { type: String, required: true },
      receiverPhone: { type: String, required: true },
      address: { type: String, required: true },
      country: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      shippingMethod: { type: String, required: true },
      shippingPrice: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    trackingNumber: {
      type: String,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["Card-To-Card"],
      required: true,
    },
    itemsPrice: { type: Number, required: true }, // total price of the cart items
    taxPrice: { type: Number, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    isRecived: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    promotions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promotion",
      },
    ],
    totalDiscount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// Add indexes for frequently queried fields
orderSchema.index({ user: 1, status: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
