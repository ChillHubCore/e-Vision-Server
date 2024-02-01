import request from "supertest";
import app from "../../server.js";
import dotenv from "dotenv";
import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import process from "process";

dotenv.config(); // Load environment variables from .env file
const seedApiKey = process.env.SEED_API_KEY;
const seedApiSecret = process.env.SEED_API_SECRET;

describe("User Routes", () => {
  describe("POST /users/signup", () => {
    // ...

    it("should create a new user", async () => {
      jest.setTimeout(10000);
      const response = await request(app)
        .post("/users/signup")
        .set({
          apiKey: seedApiKey,
          apiSecret: seedApiSecret,
        })
        .send({
          name: "John Doe",
          email: "johndoe@example.com",
          phone: "01234567890",
          password: "password123",
        });
      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.text).name).toBe("John Doe");

      const signInResponse = await request(app)
        .post("/users/signin")
        .set({
          apiKey: seedApiKey,
          apiSecret: seedApiSecret,
        })
        .send({
          email: "johndoe@example.com",
          password: "password123",
        });
      expect(signInResponse.statusCode).toBe(201);
      expect(JSON.parse(signInResponse.text).name).toBe("John Doe");
      // Additional assertions for the created user object
      const user = await User.findOne({ email: "johndoe@example.com" });
      expect(user).toBeTruthy();
      expect(user.name).toBe("John Doe");
      expect(user.email).toBe("johndoe@example.com");
      expect(user.phone).toBe("01234567890");
      const passwordMatch = bcrypt.compareSync("password123", user.password);
      expect(passwordMatch).toBe(true);

      await User.deleteOne({ email: "johndoe@example.com" });
    });
  });
});
