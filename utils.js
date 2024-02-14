import jwt from "jsonwebtoken";
import process from "process";

/**
 * Generates a token for the given user.
 * @param {Object} user - The user object.
 * @param {string} user._id - The user's ID.
 * @param {string} user.name - The user's name.
 * @param {string} user.email - The user's email.
 * @param {boolean} user.isAdmin - Indicates if the user is an admin.
 * @returns {string} - The generated token.
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isCreator: user.isCreator,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
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
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid Token" });
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
  if (req.user && req.user.isCreator) {
    next();
  } else {
    res.status(401).send({ message: "You Are Not a Creator!" });
  }
};
