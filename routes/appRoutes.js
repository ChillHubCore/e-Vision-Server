import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth, isCreator } from "../utils.js";
import dotenv from "dotenv";
import App from "../models/appModel.js";
import { appValidator } from "../validators/appValidators.js";

dotenv.config();

const appRouter = express.Router();

appRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const {
      name,
      description,
      logo,
      userStatus,
      contactAddresses,
      primaryCurrency,
      extraCurrenciesSupported,
      postalOptions,
      paymentOptions,
      taxRate,
      CardToCard,
    } = req.body.values;

    const highestVersion = await App.findOne({}, {}, { sort: { version: -1 } });
    const newVersion = highestVersion ? highestVersion.version + 1 : 1;

    const app = new App({
      name,
      primaryCurrency,
      extraCurrenciesSupported,
      description,
      version: newVersion,
      logo,
      userStatus,
      contactAddresses,
      postalOptions,
      paymentOptions,
      taxRate,
      CardToCard,
    });

    const validatedApp = appValidator.safeParse(app);

    if (!validatedApp.success) {
      res.status(400).send({ message: validatedApp.error });
      return;
    }

    try {
      const createdApp = await app.save();
      res.status(201).json(createdApp);
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

appRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { desc } = req.query;
    try {
      const apps = await App.find({
        version: { $exists: true },
      }).sort({ version: desc === "false" ? 1 : -1 });
      res.json(apps);
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

appRouter.get(
  "/latest",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const app = await App.findOne({}, {}, { sort: { version: -1 } });
      res.json(app);
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

appRouter.get(
  "/payment-options",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { type } = req.query;
    try {
      if (type === "Card-To-Card") {
        const app = await App.findOne({}, {}, { sort: { version: -1 } });
        const paymentOptions = app.CardToCard;
        res.json(paymentOptions);
      } else {
        res.status(400).send({ message: "Invalid payment type" });
      }
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

export default appRouter;
