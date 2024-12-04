const config = require('./utils/config');
const app = require('./app');
const logger = require('./utils/logger');

// For Vercel, use process.env.PORT as fallback
const port = process.env.PORT || config.PORT;

// Start the server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

// Export the app for Vercel
module.exports = app;
