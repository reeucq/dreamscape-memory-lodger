const mongoose = require('mongoose');

// Define Emotion Log Schema
const emotionLogSchema = new mongoose.Schema(
  {
    // Reference to the User who logs the emotion
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Primary Emotion experienced by the user with predefined options and free text entry
    primaryEmotion: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          const predefinedEmotions = [
            'Happy',
            'Sad',
            'Angry',
            'Anxious',
            'Excited',
            'Fearful',
            'Disgusted',
            'Surprised',
            'Neutral',
            'Frustrated',
            'Lonely',
            'Content',
            'Confused',
          ];
          // Allow either predefined options or valid free text input
          return predefinedEmotions.includes(v) || /^[a-zA-Z\s]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid emotion.`,
      },
    },
    // Optional Secondary Emotion with predefined options and free text entry
    secondaryEmotion: {
      type: String,
      validate: {
        validator: (v) => {
          const predefinedEmotions = [
            'Happy',
            'Sad',
            'Angry',
            'Anxious',
            'Excited',
            'Fearful',
            'Disgusted',
            'Surprised',
            'Neutral',
            'Frustrated',
            'Lonely',
            'Content',
            'Confused',
          ];
          // Optional field, allowing predefined or free text
          return (
            predefinedEmotions.includes(v) || !v || /^[a-zA-Z\s]+$/.test(v)
          );
        },
        message: (props) => `${props.value} is not a valid emotion.`,
      },
    },
    // Emotion Intensity (scale of 1-7) to gauge the strength of the emotion
    emotionIntensity: {
      type: Number,
      min: 1,
      max: 7,
      required: true,
    },
    // Emotion Duration in hours (1-24)
    emotionDuration: {
      type: Number,
      min: 1,
      max: 24,
      required: true,
    },
    // List of triggers that caused the emotion (required field)
    triggers: {
      type: [String],
      required: true,
    },
    // Physical sensations experienced, with predefined options and free text entry
    physicalSensations: {
      type: [String],
      validate: {
        validator: (v) => {
          const predefinedSensations = [
            'Headache',
            'Tight Chest',
            'Fatigue',
            'Sweating',
            'Racing Heart',
            'Muscle Tension',
            'Dizziness',
            'Nausea',
            'Shortness of Breath',
            'Trembling',
            'Hot or Cold Flashes',
            'Stomach Pain',
            'Sleep Issues',
            'Loss of Appetite',
            'None',
            'Other',
          ];
          // Allow either predefined options or free text
          return v.every(
            (sensation) =>
              predefinedSensations.includes(sensation) ||
              /^[a-zA-Z\s]+$/.test(sensation)
          );
        },
        message: (props) => `${props.value} is not a valid physical sensation.`,
      },
      default: [],
    },
    // Daily activities performed by the user, with predefined options and free text entry
    dailyActivities: {
      type: [String],
      validate: {
        validator: (v) => {
          const predefinedActivities = [
            'Work',
            'Study',
            'Exercise',
            'Socializing',
            'Leisure',
            'Hobbies',
            'Household Chores',
            'Sleep',
            'Self Care',
            'Meditation',
            'Eating',
            'Commuting',
            'Caregiving',
            'Shopping',
            'Healthcare',
            'Other',
          ];
          // Allow either predefined activities or free text
          return v.every(
            (activity) =>
              predefinedActivities.includes(activity) ||
              /^[a-zA-Z\s]+$/.test(activity)
          );
        },
        message: (props) => `${props.value} is not a valid activity.`,
      },
      default: [],
    },
    // Location of the emotional experience with predefined options and free text entry
    location: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          const predefinedLocations = [
            'Home',
            'Work',
            'School',
            'University',
            "Friend's Place",
            'Outside',
            'Gym',
            'Restaurant or Cafe',
            'Shopping Center',
            'Medical Facility',
            'Transit',
            'Nature',
            'Other',
          ];
          // Allow either predefined locations or valid free text
          return (
            predefinedLocations.includes(v) || /^[a-zA-Z0-9\s,.'-]+$/.test(v)
          );
        },
        message: (props) =>
          `${props.value} is not a valid location. Please provide a valid place or select from predefined options.`,
      },
    },
    // List of people involved in the emotional experience (free text entry for each name)
    peopleInvolved: {
      type: [String],
      validate: {
        validator: (v) => {
          // Ensures each name is valid free text input
          return v.every((person) => /^[a-zA-Z\s,.'-]+$/.test(person));
        },
        message: (props) =>
          `${props.value} contains invalid characters. Only letters and common punctuation are allowed for names.`,
      },
      default: [],
    },
    // Overall day rating on a scale of 1-10 (required)
    overallDayRating: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    // User's reflection on their emotions and experience (optional)
    reflection: {
      type: String,
      trim: true,
    },
    // Gratitude field where the user can log what they're grateful for (optional)
    gratitude: {
      type: String,
      trim: true,
    },
  },
  {
    // Automatically add timestamps for creation and update times
    timestamps: true,
  }
);

// Transform _id and remove internal fields like __v and passwordHash from the returned JSON object
emotionLogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Define the EmotionLog model based on the schema
const EmotionLog = mongoose.model('EmotionLog', emotionLogSchema);

module.exports = EmotionLog;
