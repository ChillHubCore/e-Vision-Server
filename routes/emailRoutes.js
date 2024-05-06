import express from "express";
import expressAsyncHandler from "express-async-handler";
import {
  encryptMessage,
  decryptMessage,
  isAuth,
  isTeamMember,
} from "../utils.js";
import Email from "../models/emailModel.js";
import User from "../models/userModel.js";

const emailRouter = express.Router();

emailRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const {
      sentFlag,
      recivedFlag,
      title,
      username,
      timeCreatedGTE,
      timeCreatedLTE,
      pageNumber = 1,
      limit,
      readOnly,
      unreadOnly,
      desc = "false",
    } = req.query;
    const searchQuery = {};
    if (username !== undefined && username.trim() !== "") {
      const senderProfile = await User.findOne({ username }).select(
        "-password",
      );
      searchQuery.sender = senderProfile._id;
    }
    if (title !== undefined && title.trim() !== "") {
      searchQuery.title = { $regex: title, $options: "i" };
    }
    if (timeCreatedGTE !== undefined && timeCreatedGTE.trim() !== "") {
      searchQuery.createdAt = { $gte: new Date(timeCreatedGTE) };
    }
    if (timeCreatedLTE !== undefined && timeCreatedLTE.trim() !== "") {
      searchQuery.createdAt = { $lte: new Date(timeCreatedLTE) };
    }
    if (readOnly !== undefined && readOnly === "true") {
      searchQuery.readFlag = true;
    }
    if (unreadOnly !== undefined && unreadOnly === "true") {
      searchQuery.readFlag = false;
    }

    if (sentFlag !== undefined && sentFlag === "true") {
      try {
        const totalEmails = await Email.countDocuments({
          sender: req.user._id,
          ...searchQuery,
        });
        const pageSize = limit ? Number(limit) : totalEmails;
        const skip = (pageNumber - 1) * pageSize;

        const myEmails = await Email.find({
          sender: req.user._id,
          ...searchQuery,
        })
          .populate("receiver", "username _id")
          .sort({ createdAt: desc === "true" ? -1 : 1 })
          .limit(pageSize)
          .skip(skip);

        res.json(myEmails);
      } catch {
        res.status(404).json({ message: "Emails not found" });
      }
    } else if (recivedFlag !== undefined && recivedFlag === "true") {
      try {
        const totalEmails = await Email.countDocuments({
          receiver: req.user._id,
          ...searchQuery,
        });
        const pageSize = limit ? Number(limit) : totalEmails;
        const skip = (pageNumber - 1) * pageSize;

        const myEmails = await Email.find({
          receiver: req.user._id,
          ...searchQuery,
        })
          .populate("sender", "username _id")
          .sort({ createdAt: desc === "true" ? -1 : 1 })
          .limit(pageSize)
          .skip(skip);

        res.json(myEmails);
      } catch {
        res.status(404).json({ message: "Emails not found" });
      }
    } else {
      try {
        const totalEmails = await Email.countDocuments({
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
          ...searchQuery,
        });
        const pageSize = limit ? Number(limit) : totalEmails;
        const skip = (pageNumber - 1) * pageSize;

        const myEmails = await Email.find({
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
          ...searchQuery,
        })
          .populate("sender", "username _id")
          .populate("receiver", "username _id")
          .sort({ createdAt: desc === "true" ? -1 : 1 })
          .limit(pageSize)
          .skip(skip);

        res.json(myEmails);
      } catch {
        res.status(404).json({ message: "Emails not found" });
      }
    }
  }),
);

emailRouter.post(
  "/",
  isAuth,
  isTeamMember,
  expressAsyncHandler(async (req, res) => {
    const { receiver, content, title, attachments } = req.body.values;
    const reciverUser = await User.findOne({ username: receiver });
    const cryptoMessage = encryptMessage(content);
    if (reciverUser) {
      const email = new Email({
        sender: req.user._id,
        receiver: reciverUser._id,
        content: cryptoMessage,
        title,
        attachments,
      });
      const createdEmail = await email.save();
      res.status(201).json(createdEmail);
    } else {
      res.status(404).json({ message: "Reciver not found" });
    }
  }),
);

export default emailRouter;
