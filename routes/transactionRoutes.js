import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth, isCreator } from "../utils.js";
import Transaction from "../models/transactionModel.js";

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
      const transactions = await Transaction.find({})
        .populate("user", "username")
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: desc === "false" ? -1 : 1 });
      res.send(transactions);
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

export default transactionRouter;
