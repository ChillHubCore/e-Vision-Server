/**
 * This file contains the routes for handling orders in the e-commerce server.
 * It includes routes for creating a new order, retrieving an order by ID, and retrieving orders for a specific user.
 * The routes are protected and require authentication and email verification.
 * The file exports an Express router instance.
 *
 * @module orderRoutes
 * @requires express
 * @requires express-async-handler
 * @requires ../models/orderModel
 * @requires ../utils
 */
import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { isAdmin, isAuth, isCreator } from "../utils.js";
import App from "../models/appModel.js";
const orderRouter = express.Router();

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { cartItems, shippingAddress, paymentMethod, notes } = req.body;
    const totalPriceCalculated = cartItems.reduce((a, c) => a + c.price, 0);
    const taxCalculated = totalPriceCalculated / 10;
    try {
      /**
       * Creates a new order.
       *
       * @param {Array} cartItems - The items in the cart.
       * @param {Object} shippingAddress - The shipping address for the order.
       * @param {string} paymentMethod - The payment method for the order.
       * @param {number} itemsPrice - The total price of the items in the cart.
       * @param {number} shippingPrice - The shipping price for the order.
       * @param {number} taxPrice - The tax price for the order.
       * @param {number} totalPrice - The total price of the order.
       * @param {string} user - The ID of the user placing the order.
       * @returns {Object} - The newly created order.
       */
      const newOrder = new Order({
        cartItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: totalPriceCalculated,
        taxPrice: taxCalculated,
        user: req.user._id,
        notes,
      });

      const order = await newOrder.save();
      res.status(201).send({ message: "New Order Created.", order });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal Server Error - 500" });
    }
  }),
);

orderRouter.post(
  "/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const {
      cartItems,
      shippingAddress,
      paymentMethod,
      notes,
      user,
      promotions,
    } = req.body.values;
    const GenerateCartItemsIdSchema = cartItems.map((item) => ({
      quantity: item.quantity,
      product: item.product._id,
      variant: item.variant._id,
    }));
    const GenerateVariantIdSchema = cartItems.map((item) => item.variant._id);
    try {
      const choosenProducts = await Product.find({
        "variants._id": { $in: GenerateVariantIdSchema },
      });

      const totalCartItemsPrice = GenerateCartItemsIdSchema.reduce(
        (total, item) => {
          const product = choosenProducts.find((p) =>
            p.variants.some(
              (v) => v._id.toString() === item.variant.toString(),
            ),
          );
          if (product) {
            const variant = product.variants.find(
              (v) => v._id.toString() === item.variant.toString(),
            );
            const price = variant.price.discountedPrice
              ? variant.price.discountedPrice
              : variant.price.regularPrice;
            return total + price * item.quantity;
          }
          return total;
        },
        0,
      );

      const highestVersionApp = await App.findOne({})
        .sort({ version: -1 })
        .select("taxRate");
      const CurrentTaxRate = highestVersionApp.taxRate;
      const taxPrice = totalCartItemsPrice * (CurrentTaxRate / 100);
      const newOrder = new Order({
        cartItems: GenerateCartItemsIdSchema,
        shippingAddress,
        paymentMethod,
        itemsPrice: totalCartItemsPrice,
        taxPrice,
        user,
        notes,
        status: "pending",
        promotions,
      });
      const order = await newOrder.save();
      res.status(201).send({ message: "New Order Created.", order });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal Server Error - 500", error });
    }
  }),
);

orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      /**
       * Retrieves an order by its ID.
       * @param {string} req.params.id - The ID of the order to retrieve.
       * @returns {Promise<Object>} The order object.
       */
      const order = await Order.findById({
        _id: req.params.id,
        user: req.user._id,
      })
        .populate("cartItems")
        .populate("user", "username");
      if (order) {
        res.send(order);
      } else {
        res.status(404).send({ message: "Order Not Found - 404" });
      }
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error - 500" });
    }
  }),
);

orderRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      /**
       * Retrieves orders for a specific user.
       * @type {Array<Object>}
       */
      const orders = await Order.find({ user: req.user._id });
      res.send(orders);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error - 500" });
    }
  }),
);

orderRouter.get(
  "/all",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      const orders = await Order.find().populate("user", "name");
      res.send(orders);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error - 500" });
    }
  }),
);

export default orderRouter;