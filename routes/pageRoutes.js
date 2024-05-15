import express from "express";
import Page from "../models/pageModel.js";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth } from "../utils.js";

const pageRouter = express.Router();

pageRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { title, slug, keywords, description, active } = req.body.values;
    try {
      const page = new Page({
        title,
        slug,
        keywords,
        description,
        active,
        creator: req.user._id,
      });
      const createdPage = await page.save();
      res.status(201).send(createdPage);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }),
);

pageRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { title, slug, keywords, description, active } = req.body.values;

    try {
      const page = await Page.findById(req.params.id);
      if (page) {
        page.title = title || page.title;
        page.slug = slug || page.slug;
        page.keywords = keywords || page.keywords;
        page.description = description || page.description;
        page.active = active || page.active;

        const updatedPage = await page.save();
        res.send(updatedPage);
      } else {
        res.status(404).send({ message: "Page Not Found" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }),
);

pageRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const {
        title,
        slug,
        timeCreatedGTE,
        timeCreatedLTE,
        description,
        pageNumber = 1,
        limit,
        desc = "false",
      } = req.query;
      const searchQuery = {};
      if (title) {
        searchQuery.title = { $regex: title, $options: "i" };
      }
      if (slug) { 
        searchQuery.slug = { $regex: slug, $options: "i" };
      }
      if (description) { 
        searchQuery.description = { $regex: description, $options: "i" };
      }
      if (timeCreatedGTE || timeCreatedLTE) { 
        searchQuery.createdAt = {};
        if (timeCreatedGTE) {
          searchQuery.createdAt.$gte = new Date(timeCreatedGTE);
        }
        if (timeCreatedLTE) {
          searchQuery.createdAt.$lte = new Date(timeCreatedLTE);
        }
      }
      const totalPages = await Page.countDocuments(searchQuery);
      const pageSize = limit ? Number(limit) : totalPages;
      const skip = (pageNumber - 1) * pageSize;
      const pages = await Page.find(searchQuery)
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: desc === "true" ? -1 : 1 });
      res.send({ pages, length: totalPages });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }),
);

pageRouter.get(
  "/active/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);
      if (page) {
        res.send(page);
      } else {
        res.status(404).send({ message: "Page Not Found" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }),
);

pageRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);
      if (page) {
        await Page.deleteOne({ _id: req.params.id });
        res.send({ message: "Page Deleted" });
      } else {
        res.status(404).send({ message: "Page Not Found" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }),
);

export default pageRouter;
