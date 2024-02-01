/**
 * ESLint configuration file for the project.
 *
 * @module .eslintrc.cjs
 * @see {@link https://eslint.org/docs/user-guide/configuring|ESLint Configuration}
 */
module.exports = {
  plugins: ["jest", "security"],
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:security/recommended",
  ],
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  overrides: [
    {
      env: {
        node: true,
        es6: true,
      },
      parserOptions: {
        sourceType: "module",
      },
      files: ["**/*.js", "**/*.cjs"], // Add files attribute here
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "linebreak-style": ["error", "windows"],
  },
};
