/*
    This file contains the configuration for the application.
    The configuration is used to set the port and the MongoDB URI.
*/
require('dotenv').config();

// Load test environment variables if we're in test mode
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
}

const PORT = process.env.PORT;
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI || process.env.MONGODB_URI
    : process.env.MONGODB_URI;

module.exports = {
  MONGODB_URI,
  PORT,
};
