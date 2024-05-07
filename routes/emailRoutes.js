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
import { EncryptionKeys } from "../vault/index.js";

const emailRouter = express.Router();

emailRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const {
      sentFlag,
      receivedFlag,
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

    if (title !== undefined && title.trim() !== "") {
      searchQuery.title = { $regex: title, $options: "i" };
    }
    if (timeCreatedGTE !== undefined && timeCreatedGTE.trim() !== "") {
      searchQuery.createdAt = { $gte: new Date(timeCreatedGTE) };
    }
    if (timeCreatedLTE !== undefined && timeCreatedLTE.trim() !== "") {
      searchQuery.createdAt = { $lte: new Date(timeCreatedLTE) };
    }
    if (readOnly === "true") {
      searchQuery.readFlag = true;
    }
    if (unreadOnly === "true") {
      searchQuery.readFlag = false;
    }

    if (sentFlag === "true" && receivedFlag === "false") {
      try {
        if (username !== undefined && username.trim() !== "") {
          searchQuery.receiverUsername = { $regex: username, $options: "i" };
        }
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
          .skip(skip)
          .limit(pageSize)
          .populate("sender", "username _id")
          .populate("receiver", "username _id")
          .sort({ createdAt: desc === "true" ? -1 : 1 })
          .select("-content");

        res.json({ emails: myEmails, length: totalEmails });
      } catch (err) {
        console.log(err);
        res.status(404).json({ message: "Emails not found" });
      }
    } else if (receivedFlag === "true" && sentFlag === "false") {
      if (username !== undefined && username.trim() !== "") {
        searchQuery.senderUsername = { $regex: username, $options: "i" };
      }
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
          .skip(skip)
          .limit(pageSize)
          .populate("sender", "username _id")
          .populate("receiver", "username _id")
          .sort({ createdAt: desc === "true" ? -1 : 1 })
          .select("-content");

        res.json({ emails: myEmails, length: totalEmails });
      } catch (err) {
        console.log(err);
        res.status(404).json({ message: "Emails not found" });
      }
    } else {
      if (username !== undefined && username.trim() !== "") {
        searchQuery.$or = [
          { senderUsername: { $regex: username, $options: "i" } },
          { receiverUsername: { $regex: username, $options: "i" } },
        ];
      }
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
          .skip(skip)
          .limit(pageSize)
          .populate("sender", "username _id")
          .populate("receiver", "username _id")
          .sort({ createdAt: desc === "true" ? -1 : 1 })
          .select("-content");

        res.json({ emails: myEmails, length: totalEmails });
      } catch (err) {
        console.log(err);
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
    const receiverUser = await User.findOne({ username: receiver });
    const EncryptionKeyVersion = Math.max(
      ...EncryptionKeys.map((key) => key.keyVersion),
    );
    const cryptoMessage = encryptMessage(content);
    if (receiverUser) {
      const email = new Email({
        sender: req.user._id,
        senderUsername: req.user.username,
        receiver: receiverUser._id,
        receiverUsername: receiverUser.username,
        content: cryptoMessage,
        title,
        attachments,
        EncryptionKeyVersion,
      });
      try {
        const createdEmail = await email.save();
        res.status(201).json(createdEmail);
      } catch (err) {
        console.log(err);
        res
          .status(404)
          .json({ message: "Something Went Wrong When Creating The Email" });
      }
    } else {
      res.status(404).json({ message: "Receiver not found" });
    }
  }),
);

emailRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const email = await Email.findById(req.params.id);
      const EncryptionKeyVersion = Math.max(
        ...EncryptionKeys.map((key) => key.keyVersion),
      );
      if (email) {
        if (
          email.receiver.toString() === req.user._id.toString() ||
          email.sender.toString() === req.user._id.toString() ||
          req.user.isAdmin
        ) {
          const decryptedEmail = decryptMessage(
            email.content,
            EncryptionKeyVersion,
          );
          if (email.receiver.toString() === req.user._id.toString()) {
            email.readFlag = true;
            await email.save();
          }
          res.json({ ...email._doc, content: decryptedEmail });
        } else {
          res
            .status(404)
            .json({ message: "You are not authorized to view this email!" });
        }
      } else {
        res.status(404).json({ message: "Email not found" });
      }
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: "Internal Server Error!" });
    }
  }),
);

export default emailRouter;
