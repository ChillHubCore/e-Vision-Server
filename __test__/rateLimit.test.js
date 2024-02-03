import request from "supertest";
import app from "../server.js";

describe("Rate Limit Test", () => {
  it("should return 429 Too Many Requests when rate limit is exceeded", async () => {
    // Simulate exceeding the rate limit
    for (let i = 0; i < 15; i++) {
      await request(app).get("/check");
    }

    // Make a request that should exceed the rate limit
    const response = await request(app).get("/check");

    // Assert that the response status code is 429
    expect(response.status).toBe(429);
  });
});
