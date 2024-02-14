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
    /**
     * Represents a new user.
     * @typedef {Object} User
     * @property {string} name - The name of the user.
     * @property {string} email - The email of the user.
     * @property {string} phone - The phone of the user.
     * @property {Array} addresses - The addresses of the user.
     * @property {string} password - The hashed password of the user.
     * create a new user and return a auto generated hash token which lasts for a short period to keep them logged in
     */

    const validatePassword = passwordValidator(req.body.password);
    const validateEmail = emailValidator(req.body.email);
    const validatePhone = phoneValidator(req.body.phone);

    if (!validatePassword)
      return res.status(400).send({
        message: validatePassword,
      });
    if (!validateEmail) {
      return res.status(400).send({
        message: validateEmail,
      });
    }
    if (!validatePhone) {
      return res.status(400).send({
        message: validatePhone,
      });
    }
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      addresses: req.body.addresses,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.status(201).send({
      name: user.name,
      token: generateToken(user),
    });
  }),
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    /**
     * Represents a user object.
     * @typedef {Object} User
     * @property {string} name - The name of the user.
     * @property {string} email - The email of the user.
     * @property {string} phone - The phone of the user.
     * @property {string} password - The hashed password of the user.
     * update the user account details and return the updated user object
     */
    const user = await User.findById(req.params.id);
    const validatePassword = passwordValidator.parse(req.body.password);
    const validateEmail = emailValidator.parse(req.body.email);
    const validatePhone = phoneValidator.parse(req.body.phone);

    if (!validatePassword)
      return res.status(400).send({
        message: validatePassword,
      });

    if (!validateEmail) {
      return res.status(400).send({
        message: validateEmail,
      });
    }
    if (!validatePhone) {
      return res.status(400).send({
        message: validatePhone,
      });
    }

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.addresses = req.body.addresses || user.addresses;

      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password);
      }

      const updatedUser = await user.save();

      res.send({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: "User not found" });
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
    const { firstName, lastName, username, email, phone, primaryCity, pageNumber } = req.query;
    const searchQuery = {};

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
    if (phone) {
      searchQuery.phone = { $regex: phone, $options: "i" };
    }
    if (primaryCity) {
      searchQuery["addresses.city"] = { $regex: primaryCity, $options: "i" };
    }

    const pageSize = 30;
    const skip = (pageNumber - 1) * pageSize;

    const users = await User.find(searchQuery)
      .select("-password")
      .skip(skip)
      .limit(pageSize);

    res.send(users);
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
      res.send(user);
    } else {
      res.status(404).send({ message: "User not found" });
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
      if (user.isAdmin) {
        res.status(403).send({ message: "Admin user cannot be deleted" });
      } else {
        await user.remove();
        res.send({ message: "User deleted" });
      }
    } else {
      res.status(404).send({ message: "User not found" });
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
      return res.status(400).send({
        message: validateEmail,
      });
    }
    const user = await User.findOne({ email: SigninFormValues.email });

    if (user) {
      if (bcrypt.compareSync(SigninFormValues.password, user.password)) {
        res.status(201).send({
          name: user.name,
          isCreator: user.isCreator,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Email or Password is Wrong!" });
  }),
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const SignupFormValues = req.body.values;

    const validatePassword = passwordValidator.parse(SignupFormValues.password);
    const validateEmail = emailValidator.parse(SignupFormValues.email);
    const validatePhone = phoneValidator.parse(SignupFormValues.phone);

    if (!validatePassword)
      return res.status(400).send({
        message: validatePassword,
      });
    if (!validateEmail) {
      return res.status(400).send({
        message: validateEmail,
      });
    }
    if (!validatePhone) {
      return res.status(400).send({
        message: validatePhone,
      });
    }
    const newUser = new User({
      firstName: SignupFormValues.firstName,
      lastName: SignupFormValues.lastName,
      username: SignupFormValues.username,
      email: SignupFormValues.email,
      phone: SignupFormValues.phone,
      password: bcrypt.hashSync(SignupFormValues.password),
    });
    const user = await newUser.save();
    res.status(201).send({
      name: user.name,
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

export default userRouter;
