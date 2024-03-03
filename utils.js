import jwt from "jsonwebtoken";
import process from "process";

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
