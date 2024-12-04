const mongoose = require('mongoose');
const testDataGenerator = require('../tests/helpers/testDataGenerator');
const config = require('./config');
const logger = require('./logger');

const populateDatabase = async () => {
  try {
    // Connect to the production MongoDB collection
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Clean up existing data
    await testDataGenerator.cleanupTestData();
    logger.info('Cleaned up existing test data.');

    // Generate a test user
    const user = await testDataGenerator.generateTestUser();
    logger.info('Generated user:', user);

    // Generate emotion logs for the generated user
    await testDataGenerator.generateTestEmotionLogs(user._id);
    logger.info('Generated emotion logs for user:', user.username);

    logger.info('Database populated successfully!');
  } catch (error) {
    logger.error('Error populating the database:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

populateDatabase();
