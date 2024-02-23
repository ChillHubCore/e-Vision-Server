import express from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { isAdmin, isAuth, isCreator } from "../utils.js";
import dotenv from "dotenv";

dotenv.config();

const productRouter = express.Router();

productRouter.post(
  "/",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    const CreateProductFormValues = req.body.values;

    const newProduct = new Product({
      name: CreateProductFormValues.name,
      slug: CreateProductFormValues.slug,
      brand: CreateProductFormValues.brand,
      category: CreateProductFormValues.category,
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
  }),
);

export default productRouter;
