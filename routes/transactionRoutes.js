import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth, isCreator } from "../utils.js";
import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import {
  SendNotificationForOneUser,
  inStockCheck,
} from "../functions/index.js";
import App from "../models/appModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";

const transactionRouter = express.Router();

transactionRouter.get(
  "/",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    const {
      pageNumber = 1,
      limit,
      desc = "false",
      status,
      username,
      timeCreatedGTE,
      timeCreatedLTE,
    } = req.query;
    const searchQuery = {};
    if (status) {
      searchQuery.status = status;
    }
    if (timeCreatedGTE || timeCreatedLTE) {
      searchQuery.createdAt = {};
      if (timeCreatedGTE) {
        searchQuery.createdAt.$gte = timeCreatedGTE;
      }
      if (timeCreatedLTE) {
        searchQuery.createdAt.$lte = timeCreatedLTE;
      }
    }

    const pageSize = limit ? Number(limit) : 30;
    const skip = (pageNumber - 1) * pageSize;

    try {
      const transactions = await Transaction.find(searchQuery).populate(
        "user",
        "username",
      );

      const filteredTransactions = transactions.filter(
        (transaction) =>
          transaction.user.username
            .toLowerCase()
            .includes(username.toLowerCase()) ||
          username
            .toLowerCase()
            .includes(transaction.user.username.toLowerCase()),
      );

      const sortedTransactions = filteredTransactions.sort((a, b) => {
        if (desc === "false") {
          return b.createdAt - a.createdAt;
        } else {
          return a.createdAt - b.createdAt;
        }
      });

      const paginatedTransactions = sortedTransactions.slice(
        skip,
        skip + pageSize,
      );
      const totalTransactions = sortedTransactions.length;
      res.send({
        transactions: paginatedTransactions,
        length: totalTransactions,
      });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }),
);

transactionRouter.get(
  "/:id",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id).populate(
        "user",
        "username",
      );
      if (transaction) {
        res.send(transaction);
      } else {
        res.status(404).send({ message: "Transaction Not Found" });
      }
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }),
);

transactionRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const TransactionFormData = req.body.values;
    try {
      const transaction = new Transaction({
        user: TransactionFormData.user,
        order: TransactionFormData.order,
        description: TransactionFormData.description,
        creator: req.user._id,
        updatedBy: req.user._id,
        status: "pending",
      });
      const createdTransaction = await transaction.save();
      res.status(201).send({
        message: "Transaction Created",
        transaction: createdTransaction,
      });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }),
);

transactionRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id);
      if (transaction) {
        transaction.status = req.body.status || transaction.status;
        transaction.updatedBy = req.user._id;
        const updatedTransaction = await transaction.save();
        res.send({
          message: "Transaction Updated",
          transaction: updatedTransaction,
        });
      } else {
        res.status(404).send({ message: "Transaction Not Found" });
      }
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }),
);

transactionRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id);
      if (transaction) {
        const deletedTransaction = await Transaction.deleteOne({
          _id: req.params.id,
        });
        res.send({
          message: "Transaction Deleted",
          transaction: deletedTransaction,
        });
      } else {
        res.status(404).send({ message: "Transaction Not Found" });
      }
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }),
);

transactionRouter.post(
  "/:id/payment-process",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id);
      if (transaction && transaction.status === "pending") {
        transaction.status = "in-process";
        transaction.updatedBy = req.user._id;
        const user = await User.findById(transaction.user);
        if (user) {
          const order = await Order.findById(transaction.order);
          if (order) {
            inStockCheck(order.cartItems);
            if (order.paymentMethod === "Card-To-Card") {
              const updatedTransaction = await transaction.save();
              const allCards = await App.findOne({})
                .sort({ version: -1 })
                .select("CardToCard");
              const availableCards = allCards.CardToCard.filter(
                (card) => card.available === true,
              );
              SendNotificationForOneUser({
                userId: user._id,
                title: "Payment Process",
                message:
                  "Your payment is being processed - Check Notifications For Further Information.",
              });
              res.send({
                Cards: availableCards,
                message: "Transaction Updated",
                transaction: updatedTransaction,
              });
            }
          } else {
            res.status(404).send({ message: "Order Not Found" });
          }
        } else {
          res.status(404).send({ message: "User Not Found" });
        }
      } else {
        res.status(404).send({ message: "Transaction Not Found" });
      }
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }),
);

transactionRouter.patch(
  "/:id/submit-payment-result",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const FormValues = req.body.values;
    try {
      const transaction = await Transaction.findById(req.params.id);
      const order = await Order.findById(transaction.order);
      inStockCheck(order.cartItems);
      if (
        transaction &&
        (transaction.status === "in-process" ||
          transaction.status === "waiting-for-approval")
      ) {
        if (order.paymentMethod === "Card-To-Card") {
          transaction.paymentResult = FormValues;
          transaction.status = "waiting-for-approval";
          transaction.updatedBy = req.user._id;
          const updatedTransaction = await transaction.save();
          res.send({
            message: "Transaction Updated",
            transaction: updatedTransaction,
          });
        } else {
          res.send({ message: "Payment Method Not Supported" });
        }
      } else {
        if (!transaction) {
          res.status(404).send({ message: "Transaction Not Found" });
        }
        if (!(transaction.status === "in-process")) {
          res.status(404).send({ message: "Transaction Status Not Supported" });
        }
      }
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }),
);

// transactionRouter.patch(
//   "/:id/approve-payment",
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const session = await mongoose.startSession();

//     try {
//       const transaction = await Transaction.findById(req.params.id);
//       session.startTransaction();

//       if (transaction && transaction.status === "waiting-for-approval") {
//         const order = await Order.findById(transaction).session(session);

//         // Update variant stock
//         for (const item of order.cartItems) {
//           const product = await Product.findById(item.product).session(session);
//           if (product) {
//             const variant = product.variants.find(
//               (v) => v._id.toString() === item.variant.toString(),
//             );
//             if (variant) {
//               if (variant.inStock >= item.quantity) {
//                 variant.inStock -= item.quantity;
//                 await product.save();
//               } else {
//                 throw new Error(
//                   `Insufficient stock for product ${product._id}`,
//                 );
//               }
//             } else {
//               throw new Error(`Variant not found for product ${product._id}`);
//             }
//           } else {
//             throw new Error(`Product not found: ${item.product}`);
//           }
//         }
//         transaction.status = "success";
//         transaction.updatedBy = req.user._id;
//         const updatedTransaction = await transaction.save().session(session);
//         await session.commitTransaction();
//         res.send({
//           message: "Transaction Updated",
//           transaction: updatedTransaction,
//         });
//       } else {
//         throw new Error("Transaction not found or status not supported");
//       }
//     } catch (err) {
//       console.log(err);
//       session.abortTransaction();
//       res.status(500).send({ message: err.message });
//     } finally {
//       session.endSession();
//     }
//   }),
// );  database is not in replica mode , after data migration we will finish atomic functions...

export default transactionRouter;
