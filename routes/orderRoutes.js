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
import { inStockCheck } from "../functions/index.js";
const orderRouter = express.Router();

orderRouter.get(
  "/",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    const {
      pageNumber = 1,
      limit,
      desc = "false",
      reciverName,
      reciverPhone,
      reciverAddress,
      reciverCountry,
      reciverProvince,
      reciverCity,
      reciverPostalCode,
      shippingMethod,
      status,
      trackingNumber,
      estimatedDeliveryDate,
      actualDeliveryDate,
      paymentMethod,
      itemsPrice,
      isPaid,
      isDelivered,
      isRecived,
      timeCreatedGTE,
      timeCreatedLTE,
      deliveredAt,
      paidAt,
      promotions,
    } = req.query;

    const searchQuery = {};
    if (reciverName) {
      searchQuery["shippingAddress.reciverName"] = {
        $regex: reciverName,
        $options: "i",
      };
    }
    if (reciverPhone) {
      searchQuery["shippingAddress.reciverPhone"] = {
        $regex: reciverPhone,
        $options: "i",
      };
    }
    if (reciverAddress) {
      searchQuery["shippingAddress.address"] = {
        $regex: reciverAddress,
        $options: "i",
      };
    }
    if (reciverCountry) {
      searchQuery["shippingAddress.country"] = {
        $regex: reciverCountry,
        $options: "i",
      };
    }
    if (reciverProvince) {
      searchQuery["shippingAddress.province"] = {
        $regex: reciverProvince,
        $options: "i",
      };
    }
    if (reciverCity) {
      searchQuery["shippingAddress.city"] = {
        $regex: reciverCity,
        $options: "i",
      };
    }
    if (reciverPostalCode) {
      searchQuery["shippingAddress.postalCode"] = {
        $regex: reciverPostalCode,
        $options: "i",
      };
    }
    if (shippingMethod) {
      searchQuery["shippingAddress.shippingMethod"] = {
        $regex: shippingMethod,
        $options: "i",
      };
    }
    if (status) {
      searchQuery["status"] = {
        $regex: status,
        $options: "i",
      };
    }
    if (trackingNumber) {
      searchQuery["trackingNumber"] = {
        $regex: trackingNumber,
        $options: "i",
      };
    }
    if (estimatedDeliveryDate) {
      searchQuery["estimatedDeliveryDate"] = {
        $regex: estimatedDeliveryDate,
        $options: "i",
      };
    }
    if (actualDeliveryDate) {
      searchQuery["actualDeliveryDate"] = {
        $regex: actualDeliveryDate,
        $options: "i",
      };
    }
    if (paymentMethod) {
      searchQuery["paymentMethod"] = {
        $regex: paymentMethod,
        $options: "i",
      };
    }
    if (itemsPrice) {
      searchQuery["itemsPrice"] = {
        $regex: itemsPrice,
        $options: "i",
      };
    }
    if (isPaid !== undefined) {
      searchQuery["isPaid"] = isPaid === "true" ? true : false;
    }
    if (isDelivered !== undefined) {
      searchQuery["isDelivered"] = isDelivered === "true" ? true : false;
    }
    if (isRecived !== undefined) {
      searchQuery["isRecived"] = isRecived === "true" ? true : false;
    }
    if (timeCreatedGTE) {
      searchQuery["createdAt"] = {
        $gte: new Date(timeCreatedGTE),
      };
    }
    if (timeCreatedLTE) {
      searchQuery["createdAt"] = {
        $lte: new Date(timeCreatedLTE),
      };
    }
    if (deliveredAt) {
      searchQuery["deliveredAt"] = {
        $regex: deliveredAt,
        $options: "i",
      };
    }
    if (paidAt) {
      searchQuery["paidAt"] = {
        $regex: paidAt,
        $options: "i",
      };
    }
    if (promotions) {
      searchQuery["promotions"] = {
        $regex: promotions,
        $options: "i",
      };
    }

    const pageSize = limit ? Number(limit) : 30;
    const skip = (pageNumber - 1) * pageSize;
    try {
      const orders = await Order.find(searchQuery)
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: desc === "false" ? -1 : 1 })
        .populate("user", "username _id")
        .populate("cartItems.product");
      const totalOrders = await Order.countDocuments(searchQuery);
      res.send({ orders, length: totalOrders });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error - 500", error });
    }
  }),
);

orderRouter.get(
  "/:id",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      /**
       * Retrieves an order by its ID.
       * @param {string} req.params.id - The ID of the order to retrieve.
       * @returns {Promise<Object>} The order object.
       */
      const order = await Order.findById(req.params.id)
        .populate("user", "username _id")
        .populate("cartItems.product");
      if (order) {
        res.send(order);
      } else {
        res.status(404).send({ message: "Order Not Found - 404" });
      }
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error - 500", error });
    }
  }),
);

orderRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      /**
       * Delete a order by its ID
       */
      const order = await Order.findById(req.params.id);

      if (order) {
        await Order.deleteOne({ _id: req.params.id });
        res.status(200).send({ message: "Order deleted successfully." });
      } else {
        res.status(404).send({ message: "Order not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
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
      inStockCheck(cartItems);
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
        creator: req.user._id,
        updatedBy: req.user._id,
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

orderRouter.put(
  "/admin/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod, notes, user, promotions } =
      req.body.values;

    try {
      const order = await Order.findById(req.params.id);
      if (order && order.status === "pending") {
        if (shippingAddress) {
          order.shippingAddress = shippingAddress;
        }
        if (paymentMethod) {
          order.paymentMethod = paymentMethod;
        }
        if (user) {
          order.user = user;
        }
        if (notes) {
          order.notes = notes;
        }
        if (promotions) {
          order.promotions = promotions;
        }
        order.updatedBy = req.user._id;
        const updatedOrder = await order.save();
        res
          .status(200)
          .send({ message: "Order Updated.", order: updatedOrder });
      }
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error - 500", error });
    }
  }),
);

export default orderRouter;
