import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
