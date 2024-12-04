const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    // Username must be unique, trimmed of extra spaces, and contain only letters and numbers (3-20 characters)
    username: {
      type: String,
      required: true, // Username is required
      unique: true, // Must be unique for each user
      trim: true, // Removes leading/trailing spaces
      minLength: [3, 'Username must be at least 3 characters long'],
      maxLength: [20, 'Username must be at most 20 characters long'],
      validate: {
        validator: (v) => {
          return /^[a-zA-Z0-9]+$/.test(v); // Only letters and numbers allowed
        },
        message: (props) =>
          `${props.value} contains invalid characters. Only letters and numbers are allowed.`,
      },
    },
    // Full Name of the user with only letters allowed (3-20 characters)
    name: {
      type: String,
      required: true, // Name is required
      trim: true, // Removes leading/trailing spaces
      minLength: [3, 'Name must be at least 3 characters long'],
      maxLength: [20, 'Name must be at most 20 characters long'],
      validate: {
        validator: (v) => {
          return /^[a-zA-Z\s'-]+$/.test(v);
        },
        message: (props) =>
          `${props.value} contains invalid characters. Name must contain only letters, spaces, hyphens, and apostrophes`,
      },
    },
    // Password hash for security (instead of storing plain text passwords)
    passwordHash: {
      type: String,
      required: true, // Password is required (stored securely)
    },
    // Profile picture URL with a validator to ensure valid URL format
    profilePicture: {
      type: String,
      trim: true, // Removes leading/trailing spaces
      validate: {
        validator: (v) => {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v); // Validates the URL format
        },
        message: (props) =>
          `${props.value} is not a valid URL for a profile picture.`,
      },
      default: 'https://api.dicebear.com/9.x/thumbs/svg?seed=l4nb4jhj', // Sets a default profile picture if not provided
    },
    // Optional short bio for the user (max 200 characters)
    bio: {
      type: String,
      maxLength: [200, 'Bio must be at most 200 characters long'], // Restricts bio length to 200 characters
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt timestamps automatically

// Set transformation for JSON responses, removing sensitive or irrelevant data
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convert MongoDB _id to a string for readability
    delete returnedObject._id; // Remove internal _id field
    delete returnedObject.__v; // Remove internal version field (__v)
    delete returnedObject.passwordHash; // Remove the password hash for security reasons
  },
});

// Define the User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
