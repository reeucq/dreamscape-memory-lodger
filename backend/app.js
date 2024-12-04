/*
    This file contains the configuration for the application.
    The configuration is used to set the port and the MongoDB URI.
*/

// Import required modules
require('express-async-errors');
const config = require('./utils/config');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const helmet = require('helmet');
const usersRouter = require('./controllers/usersRouter');
const loginRouter = require('./controllers/loginRouter');
const emotionlogRouter = require('./controllers/emotionlogRouter');
const analyticsRouter = require('./controllers/analyticsRouter');
const adviceRouter = require('./controllers/adviceRouter');
const path = require('path');

// Set mongoose to not use strict mode for queries, this is to allow for querying on fields that are not defined in the schema
mongoose.set('strictQuery', false);

// MongoDB Connection
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

app.use(cors()); // Allow requests from all origins
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'https://api.dicebear.com', 'data:', 'blob:'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'https://api.dicebear.com'],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Change this to false
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Add this
  })
); // Add security headers to responses, which helps prevent common security vulnerabilities

app.use(express.json()); // Parse incoming JSON payloads
app.use(middleware.morgan); // Log requests to the console

// Routes
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/emotionlogs', emotionlogRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/advice', adviceRouter);

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle ALL other routes by serving index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle unknown endpoints and errors
// app.use(middleware.unknownEndpoint); // Handle unknown endpoints
app.use(middleware.errorHandler); // Handle errors
module.exports = app;
