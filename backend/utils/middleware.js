/*
    This file contains all the middleware functions that are used in the app
    The middleware functions are used to handle unknown endpoints and errors
    The middleware functions are used to log requests and errors
*/
const jwt = require('jsonwebtoken'); // import jsonwebtoken
const morgan = require('morgan'); // import morgan, u first also need to install morgan via npm
const logger = require('./logger'); // import logger
const User = require('../models/user'); // import user model

// morgon is a request logger and it has many configurations, we're using tiny
// we can also create new tokens that we can log during our request logging in the console
// here we are logging request body in the console, just for checking purpose, altho it is v uncommon and might as well be considered a privacy nightmare
morgan.token('body', (req, res) => JSON.stringify(req.body));

// this one is a middleware that runs when api request is made on a address that has nothing
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

// this is a middleware that runs when an error is thrown in the app
const errorHandler = (error, request, response, next) => {
  logger.info('errorHandler middleware is running');
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' });
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' });
  } else if (error.name === 'TokenExpiredError') {
    return response
      .status(401)
      .json({ error: 'Token expired, please log in again.' });
  } else if (error.name === 'MongoServerError') {
    if (error.code === 11000) {
      return response
        .status(409)
        .json({ error: 'Duplicate key error - this resource already exists' });
    }
    return response
      .status(400)
      .json({ error: 'something went wrong with mongodb server' });
  } else {
    logger.error('Unexpected error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
};

// token extractor middleware to extract the token from the request
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization'); // get the authorization header from the request
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    // check if the authorization header starts with 'bearer '
    req.token = authorization.substring(7); // extract the token from the header
  }
  next();
};

// user extractor middleware to extract the user from the token
const userExtractor = async (req, res, next) => {
  try {
    const token = req.token;
    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET);
      req.user = await User.findById(decodedToken.id);
      if (!req.user) {
        return res.status(401).json({ error: 'user not found' });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  morgan: morgan(
    ':method :url :status :res[content-length] - :response-time ms :body'
  ),
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
  userExtractor,
};
