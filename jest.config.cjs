/**
 * Jest configuration file.
 * @module jest.config
 */

module.exports = {
  /**
   * Test environment for running tests.
   * @type {string}
   */
  testEnvironment: "node",
  /**
   * Transform configuration for Jest.
   * @type {object}
   */
  transform: {
    /**
     * Transform JavaScript files using Babel.
     * @type {string}
     */
    "^.+\\.js$": "babel-jest",
  },
};
