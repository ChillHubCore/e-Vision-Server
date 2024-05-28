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
      const { title, titleClassName, containerClassName } = req.body;
      const findFooter = await Footer.findOne();
      if (findFooter) {
        if (title !== undefined) findFooter.title = title;
        if (titleClassName !== undefined)
          findFooter.titleClassName = titleClassName;
        if (containerClassName !== undefined)
          findFooter.containerClassName = containerClassName;
        const updatedFooter = await findFooter.save();
        res.send(updatedFooter);
      } else {
        const footer = new Footer({
          title,
          titleClassName,
          containerClassName,
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
      res.send(footer);
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }),
);

export default footerRouter;
