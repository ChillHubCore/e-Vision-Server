import jwt from "jsonwebtoken";
import process from "process";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      isCreator: user.isCreator,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
      audience: process.env.allowedOrigin,
      issuer: process.env.URL,
    },
    { algorithm: "RS256" },
  );
};

/**
 * Middleware function to check if the request is authenticated.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Slice the Bearer part of the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token expired" });
        }
        res.status(403).send({ message: "Invalid Token" });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: "Token Not Found" });
  }
};

/**
 * Checks if the user is an admin.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
export const isAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "You Are Not The Admin!" });
  }
};

/**
 * Checks if the user is an admin.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
export const isCreator = (req, res, next) => {
  if (req.user.isCreator) {
    next();
  } else {
    res.status(401).send({ message: "You Are Not a Creator!" });
  }
};

export const isSupport = (req, res, next) => {
  if (req.user.role.label === "Support" || req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "You Do Not Have Support Access" });
  }
};

export const isTeamMember = (req, res, next) => {
  if (req.user.role.label === "TeamMember" || req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "You Are Not a Team Member!" });
  }
};

const key = process.env.MESSAGE_ENCRYPTION_KEY;

export function encryptMessage(message) {
  console.log(key.length)
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

// Function to decrypt a message
export function decryptMessage(encrypted) {
  const parts = encrypted.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const cipherText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(cipherText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
