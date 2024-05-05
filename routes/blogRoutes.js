import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAuth, isCreator, isTeamMember } from "../utils.js";
import Blog from "../models/blogModel.js";
import User from "../models/userModel.js";

const blogRouter = express.Router();

blogRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      id,
      slug,
      pageNumber = 1,
      limit,
      desc = "false",
      title,
      timeCreatedGTE,
      timeCreatedLTE,
      author,
    } = req.query;
    const searchQuery = {};

    if (title) {
      searchQuery.title = { $regex: title, $options: "i" };
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
    if (id) {
      searchQuery._id = id;
    }
    if (slug) {
      searchQuery.slug = slug;
    }
    if (author) {
      const authorData = await User.findOne({ username: author });
      searchQuery.author = authorData._id;
    }
    const pageSize = limit ? Number(limit) : 30;
    const skip = (pageNumber - 1) * pageSize;

    try {
      const totalBlogs = await Blog.countDocuments(searchQuery);
      const blogs = await Blog.find(searchQuery)
        .populate("author", "username _id")
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: desc === "true" ? -1 : 1 });
      res.json({ blogs: blogs, length: totalBlogs });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }),
);

blogRouter.post(
  "/",
  isAuth,
  isTeamMember,
  expressAsyncHandler(async (req, res) => {
    const { title, content, metaTitle, metaDescription, metaTags, slug } =
      req.body.values;

    const blog = new Blog({
      metaTitle,
      metaDescription,
      metaTags,
      title,
      content,
      slug,
      author: req.user._id,
    });
    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  }),
);

blogRouter.put(
  "/:id",
  isAuth,
  isTeamMember,
  expressAsyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const blog =
      req.user.isAdmin || req.user.isCreator
        ? await Blog.findById(blogId)
        : await Blog.findOne({ _id: blogId, author: req.user._id });

    if (blog) {
      blog.metaTitle = req.body.values.metaTitle || blog.metaTitle;
      blog.metaDescription =
        req.body.values.metaDescription || blog.metaDescription;
      blog.metaTags = req.body.values.metaTags || blog.metaTags;
      blog.title = req.body.values.title || blog.title;
      blog.content = req.body.values.content || blog.content;
      blog.slug = req.body.values.slug || blog.slug;
      const updatedBlog = await blog.save();
      res.json(updatedBlog);
    } else {
      res.status(404).json({ message: "Blog Not Found" });
    }
  }),
);

blogRouter.delete(
  "/:id",
  isAuth,
  isTeamMember,
  expressAsyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const blog =
      req.user.isAdmin || req.user.isCreator
        ? await Blog.findById(blogId)
        : await Blog.findOne({ _id: blogId, author: req.user._id });

    if (blog) {
      const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
      res.json(deletedBlog);
    } else {
      res.status(404).json({ message: "Blog Not Found" });
    }
  }),
);

export default blogRouter;
