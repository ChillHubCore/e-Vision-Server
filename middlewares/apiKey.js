import process from "process";

/**
 * Middleware function to authenticate API requests using apiKey and apiSecret.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */

console.log("running apiKey and apiSecret middleware...");

export const authenticateMiddleware = async (req, res, next) => {
  const apiKey = req.headers.apikey;
  const apiSecret = req.headers.apisecret;
  const seedApiKey = process.env.SEED_API_KEY;
  const seedApiSecret = process.env.SEED_API_SECRET;

  console.log("Running API Key Middleware.");

  // Check if apiKey and apiSecret are present in the request headers
  if (!apiKey || !apiSecret) {
    return res.status(401).json({ message: "Missing apiKey or apiSecret" });
  }

  // Check if the apiSecret is valid
  if (!apiKey === seedApiKey && !apiSecret === seedApiSecret) {
    return res.status(401).json({ message: "Invalid apiSecret or apiKey" });
  }

  // If everything is valid, proceed to the next middleware or route handler
  next();
};
