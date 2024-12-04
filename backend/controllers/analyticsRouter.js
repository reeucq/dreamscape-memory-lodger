const analyticsRouter = require('express').Router();
const EmotionLog = require('../models/emotionlog');
const { tokenExtractor, userExtractor } = require('../utils/middleware');

// Apply authentication middleware
analyticsRouter.use(tokenExtractor);
analyticsRouter.use(userExtractor);

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.token || !req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  next();
};

// Get emotion distribution and intensity timeline
analyticsRouter.get('/distribution', requireAuth, async (req, res) => {
  const timeRange = req.query.timeRange || 'month'; // default to month
  const userId = req.user.id;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  if (timeRange === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (timeRange === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  }

  const emotionLogs = await EmotionLog.find({
    user: userId,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Calculate emotion distribution
  const emotionDistribution = emotionLogs.reduce((acc, log) => {
    acc[log.primaryEmotion] = (acc[log.primaryEmotion] || 0) + 1;
    return acc;
  }, {});

  // Calculate intensity timeline
  const intensityTimeline = emotionLogs.map((log) => ({
    date: log.createdAt,
    intensity: log.emotionIntensity,
    emotion: log.primaryEmotion,
  }));

  res.json({
    distribution: emotionDistribution,
    timeline: intensityTimeline,
  });
});

// Get trigger analysis
analyticsRouter.get('/triggers', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const logs = await EmotionLog.find({ user: userId });

  // Count trigger frequencies
  const triggerFrequency = {};
  logs.forEach((log) => {
    log.triggers.forEach((trigger) => {
      triggerFrequency[trigger] = (triggerFrequency[trigger] || 0) + 1;
    });
  });

  // Calculate trigger-emotion correlation
  const triggerEmotionMatrix = {};
  logs.forEach((log) => {
    log.triggers.forEach((trigger) => {
      if (!triggerEmotionMatrix[trigger]) {
        triggerEmotionMatrix[trigger] = {};
      }
      triggerEmotionMatrix[trigger][log.primaryEmotion] =
        (triggerEmotionMatrix[trigger][log.primaryEmotion] || 0) + 1;
    });
  });

  res.json({
    commonTriggers: triggerFrequency,
    triggerEmotionCorrelation: triggerEmotionMatrix,
  });
});

// Get daily patterns and activity impact
analyticsRouter.get('/patterns', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const logs = await EmotionLog.find({
    user: userId,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  // Calculate daily ratings
  const dailyRatings = logs.reduce((acc, log) => {
    const day = log.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[day]) {
      acc[day] = { total: 0, count: 0 };
    }
    acc[day].total += log.overallDayRating;
    acc[day].count += 1;
    return acc;
  }, {});

  // Calculate average ratings by activity
  const activityImpact = {};
  logs.forEach((log) => {
    log.dailyActivities.forEach((activity) => {
      if (!activityImpact[activity]) {
        activityImpact[activity] = { total: 0, count: 0 };
      }
      activityImpact[activity].total += log.overallDayRating;
      activityImpact[activity].count += 1;
    });
  });

  // Calculate averages
  Object.keys(activityImpact).forEach((activity) => {
    activityImpact[activity] =
      activityImpact[activity].total / activityImpact[activity].count;
  });

  Object.keys(dailyRatings).forEach((day) => {
    dailyRatings[day] = dailyRatings[day].total / dailyRatings[day].count;
  });

  res.json({
    dailyPatterns: dailyRatings,
    activityImpact,
  });
});

// Get wellness insights
analyticsRouter.get('/wellness', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const logs = await EmotionLog.find({ user: userId });

  // Track physical sensations
  const sensationFrequency = {};
  const sensationEmotionCorrelation = {};
  logs.forEach((log) => {
    log.physicalSensations.forEach((sensation) => {
      sensationFrequency[sensation] = (sensationFrequency[sensation] || 0) + 1;

      if (!sensationEmotionCorrelation[sensation]) {
        sensationEmotionCorrelation[sensation] = {};
      }
      sensationEmotionCorrelation[sensation][log.primaryEmotion] =
        (sensationEmotionCorrelation[sensation][log.primaryEmotion] || 0) + 1;
    });
  });

  // Calculate location impact
  const locationEmotions = {};
  logs.forEach((log) => {
    if (!locationEmotions[log.location]) {
      locationEmotions[log.location] = {};
    }
    locationEmotions[log.location][log.primaryEmotion] =
      (locationEmotions[log.location][log.primaryEmotion] || 0) + 1;
  });

  res.json({
    physicalSensations: {
      frequency: sensationFrequency,
      emotionCorrelation: sensationEmotionCorrelation,
    },
    locationImpact: locationEmotions,
  });
});

// Get comprehensive activity analysis
analyticsRouter.get('/activities', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const logs = await EmotionLog.find({ user: userId });

  // Calculate activity impact on emotions and overall mood
  const activityAnalysis = {};
  logs.forEach((log) => {
    log.dailyActivities.forEach((activity) => {
      if (!activityAnalysis[activity]) {
        activityAnalysis[activity] = {
          totalMoodRating: 0,
          count: 0,
          emotions: {},
          averageIntensity: 0,
        };
      }

      activityAnalysis[activity].totalMoodRating += log.overallDayRating;
      activityAnalysis[activity].count += 1;
      activityAnalysis[activity].averageIntensity += log.emotionIntensity;

      activityAnalysis[activity].emotions[log.primaryEmotion] =
        (activityAnalysis[activity].emotions[log.primaryEmotion] || 0) + 1;
    });
  });

  // Calculate averages
  Object.keys(activityAnalysis).forEach((activity) => {
    const data = activityAnalysis[activity];
    activityAnalysis[activity] = {
      averageMoodRating: data.totalMoodRating / data.count,
      averageIntensity: data.averageIntensity / data.count,
      totalOccurrences: data.count,
      emotionDistribution: data.emotions,
    };
  });

  res.json(activityAnalysis);
});

console.log('Current NODE_ENV:', process.env.NODE_ENV);

// Allow test data generation if NOT in production
if (process.env.NODE_ENV !== 'production') {
  const generateTestData = require('../utils/generateTestData');

  analyticsRouter.post('/generate-test-data', requireAuth, async (req, res) => {
    try {
      console.log('Generating test data for user:', req.user.id);
      await generateTestData(req.user.id);
      res.json({ message: 'Test data generated successfully' });
    } catch (error) {
      console.error('Error generating test data:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = analyticsRouter;
