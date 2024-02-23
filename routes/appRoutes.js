import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth } from "../utils.js";
import dotenv from "dotenv";
import App from "../models/appModel.js";

dotenv.config();

const appRouter = express.Router();

appRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name, description, logo, version, userStatus, contactAddresses } =
      req.body;

    const app = new App({
      name,
      description,
      logo,
      version,
      userStatus,
      contactAddresses,
    });

    const createdApp = await app.save();

    res.status(201).json(createdApp);
  }),
);

export default appRouter;
