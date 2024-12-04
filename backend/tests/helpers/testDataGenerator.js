const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const EmotionLog = require('../../models/emotionlog');

// Helper to create a date n days ago
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Generate test user
const generateTestUser = async () => {
  const passwordHash = await bcrypt.hash('TestPass123!', 10);
  const user = new User({
    username: 'testuser',
    name: 'Test',
    passwordHash,
    profilePicture: 'https://placehold.co/70x70/8ACE00/000000/jpg',
    bio: 'Test user for analytics',
  });
  return user.save();
};

// Generate emotion logs for testing
const generateTestEmotionLogs = async (userId) => {
  const emotions = ['Happy', 'Sad', 'Angry', 'Anxious', 'Excited'];
  const locations = ['Home', 'Work', 'Outside', 'School'];
  const activities = ['Exercise', 'Work/Study', 'Socializing', 'Sleep'];
  const sensations = ['Headache', 'Tight Chest', 'Fatigue', 'None'];
  const triggers = ['Work Deadline', 'Family Event', 'Exercise', 'Weather'];

  const logs = [];
  // Generate 30 days of logs
  for (let i = 0; i < 30; i++) {
    const numLogsPerDay = Math.floor(Math.random() * 3) + 1; // 1-3 logs per day

    for (let j = 0; j < numLogsPerDay; j++) {
      const log = new EmotionLog({
        user: userId,
        primaryEmotion: emotions[Math.floor(Math.random() * emotions.length)],
        secondaryEmotion: emotions[Math.floor(Math.random() * emotions.length)],
        emotionIntensity: Math.floor(Math.random() * 7) + 1,
        emotionDuration: Math.floor(Math.random() * 24) + 1,
        triggers: [
          triggers[Math.floor(Math.random() * triggers.length)],
          triggers[Math.floor(Math.random() * triggers.length)],
        ],
        physicalSensations: [
          sensations[Math.floor(Math.random() * sensations.length)],
        ],
        dailyActivities: [
          activities[Math.floor(Math.random() * activities.length)],
          activities[Math.floor(Math.random() * activities.length)],
        ],
        location: locations[Math.floor(Math.random() * locations.length)],
        peopleInvolved: ['Friend', 'Family'],
        overallDayRating: Math.floor(Math.random() * 10) + 1,
        reflection: 'Test reflection',
        gratitude: 'Test gratitude',
        createdAt: daysAgo(i),
      });
      logs.push(log);
    }
  }

  return EmotionLog.insertMany(logs);
};

// Clean up test data
const cleanupTestData = async () => {
  await User.deleteMany({});
  await EmotionLog.deleteMany({});
};

module.exports = {
  generateTestUser,
  generateTestEmotionLogs,
  cleanupTestData,
};
