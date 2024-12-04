/*
    This file contains the entry point for the application.
    The server is started on the port defined in the configuration.
    The server listens for incoming requests and routes them to the appropriate endpoint.
*/

const config = require('./utils/config');
const app = require('./app');
const logger = require('./utils/logger');

// Start the server
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
