import request from "supertest";
import app from "../server.js";
import dotenv from "dotenv";
import process from "process";

dotenv.config(); // Load environment variables from .env file
const seedApiKey = process.env.SEED_API_KEY;
const seedApiSecret = process.env.SEED_API_SECRET;

//test to check server basic check response and validating api key and secret

describe("Server", () => {
  it("should listen on the specified port " + process.env.PORT, async () => {
    const response = await request(app).get("/check").set({
      apiKey: seedApiKey,
      apiSecret: seedApiSecret,
    });
    await expect(response.status).toBe(200);
  });
});
