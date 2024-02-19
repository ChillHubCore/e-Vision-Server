import express from "express";
import multer from "multer";
import { isAuth, isCreator } from "../utils.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const upload = multer();

const uploadRouter = express.Router();

console.log("Files are Served at " + process.env.FILE_SERVER);

uploadRouter.post(
  "/",
  isAuth,
  isCreator,
  upload.single("file"),
  async (req, res) => {
    try {
      const client = new S3Client({
        region: "default",
        endpoint: process.env.LIARA_ENDPOINT,
        credentials: {
          accessKeyId: process.env.LIARA_ACCESS_KEY,
          secretAccessKey: process.env.LIARA_SECRET_KEY,
        },
      });
      const fileName = Date.now() + req.file.originalname;

      const params = {
        Body: req.file.buffer,
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: fileName,
      };

      await client.send(new PutObjectCommand(params));

      res.status(200).send(`${process.env.FILE_SERVER}/${fileName}`);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "مشکل سرور" });
    }
  },
);
export default uploadRouter;
