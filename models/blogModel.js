import mongoose from "mongoose";
import { zeroEmptySpaceValidator } from "../validators/inputValidators.js";

const blogSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      required: true,
      unqiue: true,
      minlength: 3,
      maxlength: 255,
    },
    metaDescription: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    metaTags: {
      type: [String],
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    slug: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return zeroEmptySpaceValidator.safeParse(value).success;
        },
        message: "SKU should not contain any empty spaces.",
      },
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    content: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
