const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Route to create a new user
usersRouter.post('/', async (req, res) => {
  const { username, name, password, profilePicture, bio } = req.body;

  // Ensure the password is provided and meets strength requirements
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!password || !strongPasswordRegex.test(password)) {
    return res.status(400).json({
      error:
        'Password is not strong enough. It must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  // Hash the password securely
  const passwordHash = await bcrypt.hash(password, 10);

  // Create a new user object based on input data
  const user = new User({
    username,
    name,
    passwordHash,
    profilePicture,
    bio,
  });

  // Save the user to the database
  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

// Route to get a specific user by their ID
usersRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Route to update a user by their ID
// Route to update a user by their ID
usersRouter.put('/:id', async (req, res) => {
  const { username, name, profilePicture, bio, password } = req.body;

  // Create update object
  const updateData = {
    username,
    name,
    profilePicture,
    bio,
  };

  // If password is provided, hash it and add to update
  if (password) {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        error:
          'Password is not strong enough. It must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  // Find the user and update their details
  const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (updatedUser) {
    res.json(updatedUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Route to delete a user by their ID
usersRouter.delete('/:id', async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (deletedUser) {
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

module.exports = usersRouter;
