import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import sharp from "sharp"; // Import sharp library
import { isAuth } from "../utils.js";

const upload = multer();
const uploadRouter = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    streamifier
      .createReadStream(req.file.buffer)
      .pipe(sharp().resize({ width: 256, height: 256 })) // Resize the image to 512px * 512px
      .pipe(stream);
  });
};

uploadRouter.post("/", isAuth, upload.single("file"), async (req, res) => {
  try {
    const result = await streamUpload(req);
    res.send(result.secure_url);
  } catch (error) {
    console.error(error);
    console.error(`Error uploading file. Size: ${req.file.size} bytes`);
    res.status(500).send("Error uploading file");
  }
});

export default uploadRouter;
