// utils/generateTestData.js
const EmotionLog = require('../models/emotionlog');

const EMOTIONS = [
  'Happy',
  'Sad',
  'Angry',
  'Anxious',
  'Excited',
  'Fearful',
  'Disgusted',
  'Surprised',
  'Neutral',
];
const TRIGGERS = [
  'Work Deadline',
  'Family Event',
  'Traffic',
  'Exercise',
  'Social Media',
  'Weather',
  'Sleep Quality',
];
const PHYSICAL_SENSATIONS = [
  'Headache',
  'Tight Chest',
  'Fatigue',
  'Sweating',
  'Racing Heart',
  'None',
];
const ACTIVITIES = [
  'Work/Study',
  'Exercise',
  'Socializing',
  'Leisure/Hobbies',
  'Household Chores',
  'Sleep',
];
const LOCATIONS = ['Home', 'Work', 'School/University', 'Outside'];

const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomFromArrayMultiple = (arr, max = 3) => {
  const count = Math.floor(Math.random() * max) + 1;
  const results = new Set();
  while (results.size < count) {
    results.add(randomFromArray(arr));
  }
  return Array.from(results);
};

const generateEmotionLog = (userId, date) => ({
  user: userId,
  primaryEmotion: randomFromArray(EMOTIONS),
  secondaryEmotion: randomFromArray(EMOTIONS),
  emotionIntensity: Math.floor(Math.random() * 7) + 1,
  emotionDuration: Math.floor(Math.random() * 24) + 1,
  triggers: randomFromArrayMultiple(TRIGGERS),
  physicalSensations: randomFromArrayMultiple(PHYSICAL_SENSATIONS),
  dailyActivities: randomFromArrayMultiple(ACTIVITIES),
  location: randomFromArray(LOCATIONS),
  peopleInvolved: ['Family', 'Friends', 'Coworkers'].slice(
    0,
    Math.floor(Math.random() * 3) + 1
  ),
  overallDayRating: Math.floor(Math.random() * 10) + 1,
  reflection: 'Test reflection',
  gratitude: 'Test gratitude',
  createdAt: date,
  updatedAt: date,
});

const generateTestData = async (userId) => {
  try {
    // Clear existing test data for this user
    await EmotionLog.deleteMany({ user: userId });

    const logs = [];
    const today = new Date();

    // Generate data for the last 3 months
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate 1-3 logs per day
      const logsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < logsPerDay; j++) {
        const logDate = new Date(date);
        // Add random hours to spread logs throughout the day
        logDate.setHours(Math.floor(Math.random() * 24));
        logs.push(generateEmotionLog(userId, logDate));
      }
    }

    await EmotionLog.insertMany(logs);
    console.log(`Successfully generated ${logs.length} test emotion logs`);
  } catch (error) {
    console.error('Error generating test data:', error);
  }
};

module.exports = generateTestData;
