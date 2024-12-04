const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const loginRouter = require('express').Router();
const User = require('../models/user');

// Login Route
loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const user = await User.findOne({ username });

  // If user not found or password doesn't match
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      error: 'Invalid username or password',
    });
  }

  // Create the token payload with user data
  const userForToken = {
    username: user.username,
    id: user._id,
  };

  // Generate a token (using a secret key stored securely)
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: '24h', // Token expires in 24 hours
  });

  // Return token and basic user information
  res.status(200).json({
    token,
    username: user.username,
    name: user.name,
    id: user._id.toString(),
  });
});

module.exports = loginRouter;
