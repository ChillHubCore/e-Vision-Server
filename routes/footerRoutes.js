import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAuth, isCreator } from "../utils.js";
import dotenv from "dotenv";
import Footer from "../models/footerModel.js";

dotenv.config();

const footerRouter = express.Router();

footerRouter.post(
  "/",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      const { title, titleStyle, backgroundStyle } = req.body;
      const findFooter = await Footer.findOne();
      if (findFooter) {
        if (title !== undefined) findFooter.title = title;
        if (titleStyle !== undefined) findFooter.titleStyle = titleStyle;
        if (backgroundStyle !== undefined)
          findFooter.backgroundStyle = backgroundStyle;

        const updatedFooter = await findFooter.save();
        res.send(updatedFooter);
      } else {
        const footer = new Footer({
          title,
          titleStyle,
          backgroundStyle,
        });
        const createdFooter = await footer.save();
        res.status(201).send(createdFooter);
      }
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

footerRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const footer = await Footer.findOne();
      if (footer) {
        res.send(footer);
      } else {
        res.send({});
      }
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

export default footerRouter;
