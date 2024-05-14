import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  encryptMessage,
  generateToken,
  isAdmin,
  isAuth,
  isCreator,
} from "../utils.js";
import dotenv from "dotenv";
import {
  emailValidator,
  passwordValidator,
} from "../validators/userValidators.js";
import Session from "../models/sessionModel.js";
import VerificationCode from "../models/verificationCodeModel.js";
import Email from "../models/emailModel.js";
import { EncryptionKeys } from "../vault/index.js";

dotenv.config();

const userRouter = express.Router();

userRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const CreateUserFormValues = req.body.values;
      const validatePassword = passwordValidator.parse(
        CreateUserFormValues.password,
      );

      if (!validatePassword)
        return res.status(400).json({
          message: validatePassword,
        });

      const newUser = new User({
        firstName: CreateUserFormValues.firstName.trim(),
        lastName: CreateUserFormValues.lastName.trim(),
        email: CreateUserFormValues.email.trim(),
        birthDate: CreateUserFormValues.birthDate,
        countryCode: CreateUserFormValues.countryCode.trim(),
        phone: CreateUserFormValues.phone.trim(),
        username: CreateUserFormValues.username.trim(),
        isAdmin: CreateUserFormValues.isAdmin,
        role: CreateUserFormValues.role,
        isCreator: CreateUserFormValues.isCreator,
        isEmailVerified: CreateUserFormValues.isEmailVerified,
        isPhoneVerified: CreateUserFormValues.isPhoneVerified,
        password: bcrypt.hashSync(CreateUserFormValues.password),
      });
      const user = await newUser.save();
      res.status(201).json({
        message: "User Created",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          countryCode: user.countryCode,
          birthDate: CreateUserFormValues.birthDate,
          phone: user.phone,
          username: user.username,
          isAdmin: user.isAdmin,
          isCreator: user.isCreator,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      const EditUserFormValues = req.body.values;

      if (EditUserFormValues.password) {
        const validatePassword = passwordValidator.parse(
          EditUserFormValues.password,
        );
        if (!validatePassword)
          return res.status(400).json({
            message: validatePassword,
          });
      }

      if (user) {
        user.firstName =
          EditUserFormValues.firstName !== undefined
            ? EditUserFormValues.firstName.trim()
            : user.firstName;
        user.lastName =
          EditUserFormValues.lastName !== undefined
            ? EditUserFormValues.lastName.trim()
            : user.lastName;
        user.email =
          EditUserFormValues.email !== undefined
            ? EditUserFormValues.email.trim()
            : user.email;
        user.countryCode =
          EditUserFormValues.countryCode !== undefined
            ? EditUserFormValues.countryCode.trim()
            : user.countryCode;
        user.phone =
          EditUserFormValues.phone !== undefined
            ? EditUserFormValues.phone.trim()
            : user.phone;
        user.username =
          EditUserFormValues.username !== undefined
            ? EditUserFormValues.username.trim()
            : user.username;
        user.isAdmin =
          EditUserFormValues.isAdmin !== undefined
            ? EditUserFormValues.isAdmin
            : user.isAdmin;
        user.isCreator =
          EditUserFormValues.isCreator !== undefined
            ? EditUserFormValues.isCreator
            : user.isCreator;
        user.isEmailVerified =
          EditUserFormValues.isEmailVerified !== undefined
            ? EditUserFormValues.isEmailVerified
            : user.isEmailVerified;
        user.isPhoneVerified =
          EditUserFormValues.isPhoneVerified !== undefined
            ? EditUserFormValues.isPhoneVerified
            : user.isPhoneVerified;
        user.role = EditUserFormValues.role || user.role;
        user.loyaltyPoints =
          EditUserFormValues.loyaltyPoints || user.loyaltyPoints;
        user.shopTokenBalance =
          EditUserFormValues.shopTokenBalance || user.shopTokenBalance;
        user.birthDate = EditUserFormValues.birthDate || user.birthDate;
        user.role = EditUserFormValues.role || user.role;
        user.profilePicture =
          EditUserFormValues.profilePicture || user.profilePicture;

        if (
          EditUserFormValues.password !== undefined &&
          EditUserFormValues.password.trim() !== ""
        ) {
          user.password = bcrypt.hashSync(EditUserFormValues.password);
        }

        const updatedUser = await user.save();

        res.status(200).json({ message: "User updated", user: updatedUser });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    /**
     * Search for users based on query parameters
     */
    try {
      const {
        id,
        searchString,
        firstName,
        lastName,
        username,
        email,
        countryCode,
        phone,
        pageNumber = 1,
        limit,
        birthDateGTE,
        birthDateLTE,
        role,
        loyaltyPointsGTE,
        loyaltyPointsLTE,
        shopTokenBalanceGTE,
        shopTokenBalanceLTE,
        timeCreatedGTE,
        timeCreatedLTE,
        desc = "false",
      } = req.query;
      const searchQuery = {};

      if (searchString !== undefined && searchString.trim() !== "") {
        searchQuery.$or = [
          { firstName: { $regex: searchString, $options: "i" } },
          { lastName: { $regex: searchString, $options: "i" } },
          { email: { $regex: searchString, $options: "i" } },
          { phone: { $regex: searchString, $options: "i" } },
          { username: { $regex: searchString, $options: "i" } },
          { countryCode: { $regex: searchString, $options: "i" } },
        ];
      } else {
        if (firstName !== undefined && firstName.trim() !== "") {
          searchQuery.firstName = { $regex: firstName, $options: "i" };
        }
        if (lastName !== undefined && lastName.trim() !== "") {
          searchQuery.lastName = { $regex: lastName, $options: "i" };
        }
        if (username !== undefined && username.trim() !== "") {
          searchQuery.username = { $regex: username, $options: "i" };
        }
        if (email !== undefined && email.trim() !== "") {
          searchQuery.email = { $regex: email, $options: "i" };
        }
        if (countryCode !== undefined && countryCode.trim() !== "") {
          searchQuery.countryCode = { $regex: countryCode, $options: "i" };
        }
        if (phone !== undefined && phone.trim() !== "") {
          searchQuery.phone = { $regex: phone, $options: "i" };
        }
      }

      if (timeCreatedGTE !== undefined && timeCreatedGTE.trim() !== "") {
        searchQuery.createdAt = { $gte: new Date(timeCreatedGTE) };
      }
      if (timeCreatedLTE !== undefined && timeCreatedLTE.trim() !== "") {
        searchQuery.createdAt = { $lte: new Date(timeCreatedLTE) };
      }
      if (id !== undefined && id.trim() !== "") {
        searchQuery._id = id;
      }
      if (birthDateGTE !== undefined && birthDateGTE.trim() !== "") {
        searchQuery.birthDate = { $gte: new Date(birthDateGTE) };
      }
      if (birthDateLTE !== undefined && birthDateLTE.trim() !== "") {
        searchQuery.birthDate = { $lte: new Date(birthDateLTE) };
      }
      if (role !== undefined && !isNaN(parseInt(role))) {
        searchQuery["role.value"] = { $gte: parseInt(role) };
      }
      if (loyaltyPointsGTE !== undefined && loyaltyPointsGTE.trim() !== "") {
        searchQuery.loyaltyPoints = { $gte: loyaltyPointsGTE };
      }
      if (loyaltyPointsLTE !== undefined && loyaltyPointsLTE.trim() !== "") {
        searchQuery.loyaltyPoints = { $lte: loyaltyPointsLTE };
      }
      if (
        shopTokenBalanceGTE !== undefined &&
        shopTokenBalanceGTE.trim() !== ""
      ) {
        searchQuery.shopTokenBalance = { $gte: shopTokenBalanceGTE };
      }
      if (
        shopTokenBalanceLTE !== undefined &&
        shopTokenBalanceLTE.trim() !== ""
      ) {
        searchQuery.shopTokenBalance = { $lte: shopTokenBalanceLTE };
      }
      const totalUsers = await User.countDocuments(searchQuery);
      const pageSize = limit ? Number(limit) : totalUsers;
      const skip = (pageNumber - 1) * pageSize;

      const users = await User.find(searchQuery)
        .select("-password")
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: desc === "true" ? -1 : 1 });

      res.json({ users: users, length: totalUsers });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    /**
     * get a user by their ID
     */
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    /**
     * Delete a user by their ID
     */
    try {
      const user = await User.findById(req.params.id);

      if (user) {
        if (user.isAdmin === true) {
          res.status(403).json({ message: "Admin user cannot be deleted" });
        } else {
          await User.deleteOne({ _id: req.params.id });
          res.json({ message: "User deleted" });
        }
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    /**
     * Represents a user object.
     * @typedef {Object} User
     * @property {string} email - The email of the user.
     * @property {string} password - The password of the user.
     * use this endpoint to login a user and at the end send them back a auto generated hash token which last in a short period to keep them logged in
     */

    try {
      const SigninFormValues = req.body.values;
      const validateEmail = emailValidator.parse(SigninFormValues.email);

      if (!validateEmail) {
        return res.status(400).json({
          message: validateEmail,
        });
      }
      const user = await User.findOne({ email: SigninFormValues.email });

      if (user) {
        if (bcrypt.compareSync(SigninFormValues.password, user.password)) {
          const newSession = new Session({
            user: user._id,
            ip: req.ip,
            forwardedFor: req.headers["x-forwarded-for"] || "no proxy",
            origin: req.headers.origin,
            userAgent: req.headers["user-agent"],
          });

          await newSession.save();

          res.status(201).json({
            username: user.username,
            isCreator: user.isCreator,
            isAdmin: user.isAdmin,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            role: user.role,
            token: generateToken(user),
          });
          return;
        }
      }
      res.status(401).json({ message: "Email or Password is Wrong!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    try {
      const SignupFormValues = req.body.values;

      const validatePassword = passwordValidator.parse(
        SignupFormValues.password,
      );

      if (!validatePassword)
        return res.status(400).json({
          message: validatePassword,
        });

      const newUser = new User({
        firstName: SignupFormValues.firstName.trim(),
        lastName: SignupFormValues.lastName.trim(),
        username: SignupFormValues.username.trim(),
        email: SignupFormValues.email.trim(),
        birthDate: SignupFormValues.birthDate,
        countryCode: SignupFormValues.countryCode.trim(),
        phone: SignupFormValues.phone.trim(),
        password: bcrypt.hashSync(SignupFormValues.password),
      });
      const user = await newUser.save();

      const newSession = new Session({
        user: user._id,
        ip: req.ip,
        forwardedFor: req.headers["x-forwarded-for"] || "no proxy",
        origin: req.headers.origin,
        userAgent: req.headers["user-agent"],
      });

      await newSession.save();

      const EncryptionKeyVersion = Math.max(
        ...EncryptionKeys.map((key) => key.keyVersion),
      );
      const content =
        "Welcome to our platform, we are glad to have you here. Feel free to reach out to us if you have any questions or concerns. We are here to help you.";
      const cryptoMessage = encryptMessage(content);

      const chillhubUser = await User.findOne({
        email: "chillhubnet@proton.me",
      });

      const email = new Email({
        sender: chillhubUser._id,
        senderUsername: chillhubUser.username,
        receiver: user._id,
        receiverUsername: user.username,
        content: cryptoMessage,
        title: "Welcome",
        EncryptionKeyVersion,
      });

      await email.save();

      res.status(201).json({
        username: user.username,
        isCreator: user.isCreator,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        role: user.role,
        token: generateToken(user),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.get("/check/auth", isAuth, (req, res) => {
  res.send(true);
});

userRouter.get("/check/admin", isAuth, isAdmin, (req, res) => {
  res.send(true);
});

userRouter.get("/check/creator", isAuth, isCreator, (req, res) => {
  res.send(true);
});

userRouter.get(
  "/check/integrity",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const userData = await User.findById(req.user._id);
      if (
        userData._id.toString() === req.user._id &&
        userData.username === req.user.username &&
        userData.email === req.user.email &&
        userData.firstName === req.user.firstName &&
        userData.lastName === req.user.lastName &&
        userData.isAdmin === req.user.isAdmin &&
        userData.isCreator === req.user.isCreator &&
        userData.isEmailVerified === req.user.isEmailVerified &&
        userData.isPhoneVerified === req.user.isPhoneVerified &&
        userData.role.value === req.user.role.value &&
        userData.role.label === req.user.role.label
      ) {
        res.status(200).send(true);
      } else {
        res.status(401).send(false);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.post(
  "/:id/status",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      const status = req.body.status;
      if (user) {
        user.status.push(status);
        const updatedUser = await user.save();
        res
          .status(200)
          .json({ message: "User status updated", user: updatedUser });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.put(
  "/:id/status/:statusId",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      const status = req.body.status;
      if (user) {
        user.status.id(req.params.statusId).value = status.value;
        user.status.id(req.params.statusId).description = status.description;
        const updatedUser = await user.save();
        res
          .status(200)
          .json({ message: "User status updated", user: updatedUser });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.post(
  "/:id/notifications",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      const notification = req.body.notification;
      if (user) {
        user.notifications.push(notification);
        await user.save();
        res.status(200).json({
          message: "User notification updated",
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.get(
  "/mine/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-password");
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.put(
  "/mine/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-password");
      const EditUserFormValues = req.body.values;

      if (user) {
        if (
          EditUserFormValues.password !== undefined &&
          EditUserFormValues.password.trim() !== ""
        ) {
          const validatePassword = passwordValidator.parse(
            EditUserFormValues.password,
          );
          if (!validatePassword)
            return res.status(400).json({
              message: validatePassword,
            });
        }

        user.firstName =
          EditUserFormValues.firstName !== undefined
            ? EditUserFormValues.firstName.trim()
            : user.firstName;
        user.lastName =
          EditUserFormValues.lastName !== undefined
            ? EditUserFormValues.lastName.trim()
            : user.lastName;
        user.email =
          EditUserFormValues.email !== undefined
            ? EditUserFormValues.email.trim()
            : user.email;
        user.countryCode =
          EditUserFormValues.countryCode !== undefined
            ? EditUserFormValues.countryCode.trim()
            : user.countryCode;
        user.phone =
          EditUserFormValues.phone !== undefined
            ? EditUserFormValues.phone.trim()
            : user.phone;
        user.username =
          EditUserFormValues.username !== undefined
            ? EditUserFormValues.username.trim()
            : user.username;
        user.birthDate = EditUserFormValues.birthDate || user.birthDate;
        user.profilePicture =
          EditUserFormValues.profilePicture || user.profilePicture;

        const updatedUser = await user.save();

        res.status(200).json({ message: "User updated", user: updatedUser });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.put(
  "/update/telegram",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { chatUsername } = req.body.values;
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.telegramInfo = {
          chatUsername: chatUsername,
          verified: false,
        };
        await user.save();
        res.status(200).json({ message: "Telegram username saved" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

userRouter.get(
  "/verify/telegram",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        if (user.telegramInfo) {
          if (user.telegramInfo.verified === true) {
            res.status(200).json({ message: "Telegram already verified" });
          } else {
            //logic
            const checkForExistingCode = await VerificationCode.findOne({
              user: user._id,
              platform: "telegram",
            });

            if (checkForExistingCode) {
              res.status(200).json({
                message:
                  "a Code has Already Been generated wait 3 Minutes and Try Again!",
              });
            } else {
              const validationToken =
                "tg-" + Math.random().toString(36).substring(2, 10);

              const ValidationCode = new VerificationCode({
                user: user._id,
                platform: "telegram",
                code: validationToken,
              });

              await ValidationCode.save();

              res.status(200).json({ message: validationToken });
            }
          }
        } else {
          res
            .status(404)
            .json({ message: "Telegram username has not been set Yet!" });
        }
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),
);

export default userRouter;
