import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { limiter } from "./middlewares/limiter.js";
import corsMiddleware from "./middlewares/cors.js";

dotenv.config();

console.log("Running " + process.env.SOCKET_SERVER_NAME);

/**
 * Connects to the MongoDB database using the provided URI.
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 * @throws {Error} If there is an error connecting to the database.
 */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("socket server connected to db");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();
const server = createServer(app);

const numberOfProxies = process.env.NUMBER_OF_PROXIES;

app.set("trust proxy", numberOfProxies);
app.get("/ip", (request, response) => response.send(request.ip));
app.get("/x-forwarded-for", (request, response) =>
  response.send(request.headers["x-forwarded-for"]),
);
app.use(limiter);
app.use(corsMiddleware);
// app.use(authenticateMiddleware); // Based on Your Need choose cors or authenticateMiddleware (apiKey & apiSecret) or use both if needed!

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Endpoint to check if the server is running.
 * @name GET /check
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
app.get("/", (req, res) => {
  res.send("<h1>e-vision-socket-server</h1>");
});

const fallbackPort = 6000;

/**
 * The port number for the server.
 * @type {number}
 */
const port = process.env.SOCKET_PORT || fallbackPort;

!process.env.PORT &&
  console.log(
    `Seems Like You Havent Set The PORT in .env file going for the fallback port : ${fallbackPort}!`,
  );

parseInt(port) == 0 &&
  console.log(
    "Port is 0 Maybe You are In Test Envoirment Consider Changing the Port For Production!",
  );

console.log(`Running Socket on port ${port}`);

server.listen(port, () => {
  console.log(`Socket Serving at ${process.env.URL}:${port}`);
});
