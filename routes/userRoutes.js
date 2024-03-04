import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { generateToken, isAdmin, isAuth, isCreator } from "../utils.js";
import dotenv from "dotenv";
import {
  emailValidator,
  passwordValidator,
  phoneValidator,
} from "../validators/userValidators.js";

dotenv.config();

const userRouter = express.Router();

userRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const CreateUserFormValues = req.body.values;
    const validatePassword = passwordValidator.parse(
      CreateUserFormValues.password,
    );
    const validateEmail = emailValidator.parse(CreateUserFormValues.email);
    const validatePhone = phoneValidator.parse(CreateUserFormValues.phone);

    if (!validatePassword)
      return res.status(400).json({
        message: validatePassword,
      });
    if (!validateEmail) {
      return res.status(400).json({
        message: validateEmail,
      });
    }
    if (!validatePhone) {
      return res.status(400).json({
        message: validatePhone,
      });
    }

    const newUser = new User({
      firstName: CreateUserFormValues.firstName.trim(),
      lastName: CreateUserFormValues.lastName.trim(),
      email: CreateUserFormValues.email.trim(),
      countryCode: CreateUserFormValues.countryCode.trim(),
      phone: CreateUserFormValues.phone.trim(),
      username: CreateUserFormValues.username.trim(),
      isAdmin: CreateUserFormValues.isAdmin,
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
        phone: user.phone,
        username: user.username,
        isAdmin: user.isAdmin,
        isCreator: user.isCreator,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  }),
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
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

    if (EditUserFormValues.email) {
      {
        const validateEmail = emailValidator.parse(EditUserFormValues.email);
        if (!validateEmail)
          return res.status(400).json({
            message: validateEmail,
          });
      }
    }
    if (EditUserFormValues.phone) {
      const validatePhone = phoneValidator.parse(EditUserFormValues.phone);
      if (!validatePhone)
        return res.status(400).json({
          message: validatePhone,
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
    const {
      searchString,
      firstName,
      lastName,
      username,
      email,
      countryCode,
      phone,
      pageNumber,
      limit,
      timeCreatedGTE,
      timeCreatedLTE,
      desc = "false",
    } = req.query;
    const searchQuery = {};

    if (searchString) {
      searchQuery.$or = [
        { firstName: { $regex: searchString, $options: "i" } },
        { lastName: { $regex: searchString, $options: "i" } },
        { email: { $regex: searchString, $options: "i" } },
        { phone: { $regex: searchString, $options: "i" } },
        { username: { $regex: searchString, $options: "i" } },
        { countryCode: { $regex: searchString, $options: "i" } },
      ];
    } else {
      if (firstName) {
        searchQuery.firstName = { $regex: firstName, $options: "i" };
      }
      if (lastName) {
        searchQuery.lastName = { $regex: lastName, $options: "i" };
      }
      if (username) {
        searchQuery.username = { $regex: username, $options: "i" };
      }
      if (email) {
        searchQuery.email = { $regex: email, $options: "i" };
      }
      if (countryCode) {
        searchQuery.countryCode = { $regex: countryCode, $options: "i" };
      }
      if (phone) {
        searchQuery.phone = { $regex: phone, $options: "i" };
      }
    }

    if (timeCreatedGTE) {
      searchQuery.createdAt = { $gte: new Date(timeCreatedGTE) };
    }
    if (timeCreatedLTE) {
      searchQuery.createdAt = { $lte: new Date(timeCreatedLTE) };
    }

    const pageSize = limit ? Number(limit) : 30;
    const skip = (pageNumber - 1) * pageSize;

    const totalUsers = await User.countDocuments(searchQuery);
    const users = await User.find(searchQuery)
      .select("-password")
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: desc === "true" ? -1 : 1 });

    res.json({ users: users, length: totalUsers });
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
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
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
        res.status(201).json({
          username: user.username,
          isCreator: user.isCreator,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).json({ message: "Email or Password is Wrong!" });
  }),
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const SignupFormValues = req.body.values;

    const validatePassword = passwordValidator.parse(SignupFormValues.password);
    const validateEmail = emailValidator.parse(SignupFormValues.email.trim());
    const validatePhone = phoneValidator.parse(SignupFormValues.phone.trim());

    if (!validatePassword)
      return res.status(400).json({
        message: validatePassword,
      });
    if (!validateEmail) {
      return res.status(400).json({
        message: validateEmail,
      });
    }
    if (!validatePhone) {
      return res.status(400).json({
        message: validatePhone,
      });
    }
    const newUser = new User({
      firstName: SignupFormValues.firstName.trim(),
      lastName: SignupFormValues.lastName.trim(),
      username: SignupFormValues.username.trim(),
      email: SignupFormValues.email.trim(),
      countryCode: SignupFormValues.countryCode.trim(),
      phone: SignupFormValues.phone.trim(),
      password: bcrypt.hashSync(SignupFormValues.password),
    });
    const user = await newUser.save();
    res.status(201).json({
      username: user.username,
      isCreator: user.isCreator,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
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

userRouter.post(
  "/:id/status",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
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
  }),
);

userRouter.put(
  "/:id/status/:statusId",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
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
  }),
);

userRouter.post(
  "/:id/notifications",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const notification = req.body.notification;
    if (user) {
      user.notifications.push(notification);
      const updatedUser = await user.save();
      res.status(200).json({
        message: "User notification updated",
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  }),
);

export default userRouter;
