import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAuth, isCreator } from "../utils.js";
import dotenv from "dotenv";
import Header from "../models/headerModel.js";

dotenv.config();

const headerRouter = express.Router();

headerRouter.post(
  "/",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      const { title, logo, titleStyle, backgroundStyle } = req.body;
      const findHeader = await Header.findOne();
      if (findHeader) {
        if (title !== undefined) findHeader.title = title;
        if (logo !== undefined) findHeader.logo = logo;
        if (titleStyle !== undefined) findHeader.titleStyle = titleStyle;
        if (backgroundStyle !== undefined)
          findHeader.backgroundStyle = backgroundStyle;
        const updatedHeader = await findHeader.save();
        res.send(updatedHeader);
      } else {
        const header = new Header({
          title,
          logo,
          titleStyle,
          backgroundStyle,
        });
        const createdHeader = await header.save();
        res.status(201).send(createdHeader);
      }
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

headerRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const header = await Header.findOne();
      if (header) {
        res.send(header);
      } else {
        res.send({});
      }
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

export default headerRouter;
