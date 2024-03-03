import express from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { isAuth, isCreator } from "../utils.js";
import dotenv from "dotenv";

dotenv.config();

const productRouter = express.Router();

productRouter.post(
  "/",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      const CreateProductFormValues = req.body.values;

      const newProduct = new Product({
        name: CreateProductFormValues.name.trim(),
        slug: CreateProductFormValues.slug.trim().replace(/\s+/g, "-"),
        brand: CreateProductFormValues.brand.trim(),
        category: CreateProductFormValues.category.trim(),
        description: CreateProductFormValues.description,
        variants: CreateProductFormValues.variants,
        creator: req.user._id,
        sharedDetails: CreateProductFormValues.sharedDetails,
      });

      const product = await newProduct.save();
      res.status(201).json({
        message: "Product Created",
        product: product,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }),
);

productRouter.put(
  "/:id",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      const CreateProductFormValues = req.body.values;

      if (product) {
        if (req.user.isAdmin || product.creator === req.user._id) {
          if (CreateProductFormValues.name) {
            product.name = CreateProductFormValues.name;
          }
          if (CreateProductFormValues.slug) {
            product.slug = CreateProductFormValues.slug;
          }
          if (CreateProductFormValues.brand) {
            product.brand = CreateProductFormValues.brand;
          }
          if (CreateProductFormValues.category) {
            product.category = CreateProductFormValues.category;
          }
          if (CreateProductFormValues.description) {
            product.description = CreateProductFormValues.description;
          }
          if (CreateProductFormValues.variants) {
            product.variants = CreateProductFormValues.variants;
          }
          if (CreateProductFormValues.sharedDetails) {
            product.sharedDetails = CreateProductFormValues.sharedDetails;
          }

          const updatedProduct = await product.save();
          res
            .status(200)
            .send({ message: "Product updated", product: updatedProduct });
        } else {
          res.status(403).send({
            message: "You are not authorized to update this product.",
          });
        }
      } else {
        res.status(404).send({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }),
);

productRouter.get(
  "/",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      /**
       * Search for users based on query parameters
       */
      const {
        pageNumber = 1,
        limit,
        desc = "false",
        name,
        brand,
        category,
        timeCreatedGTE,
        timeCreatedLTE,
      } = req.query;
      const searchQuery = {};

      if (name) {
        searchQuery.name = { $regex: name, $options: "i" };
      }
      if (brand) {
        searchQuery.brand = { $regex: brand, $options: "i" };
      }
      if (category) {
        searchQuery.category = { $regex: category, $options: "i" };
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

      const pageSize = limit ? Number(limit) : 30;
      const skip = (pageNumber - 1) * pageSize;

      const totalProducts = await Product.countDocuments(searchQuery);
      const products = await Product.find(searchQuery)
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: desc === "true" ? -1 : 1 });

      res.json({ products: products, length: totalProducts });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }),
);

productRouter.get(
  "/:id",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (product) {
        res.json(product);
      } else {
        res.status(404).send({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }),
);

productRouter.delete(
  "/:id",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    try {
      /**
       * Delete a product by its ID
       */
      const product = await Product.findById(req.params.id);

      if (product) {
        if (req.user.isAdmin) {
          await Product.deleteOne({ _id: req.params.id });
          res.status(200).send({ message: "Product deleted successfully." });
        } else if (product.creator === req.user._id) {
          await Product.deleteOne({ _id: req.params.id });
          res.status(200).send({ message: "Product deleted successfully." });
        } else {
          res.status(403).send({
            message: "You are not authorized to delete this product.",
          });
        }
      } else {
        res.status(404).send({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }),
);

export default productRouter;
