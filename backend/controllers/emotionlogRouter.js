const emotionLogRouter = require('express').Router();
const EmotionLog = require('../models/emotionlog');
const { tokenExtractor, userExtractor } = require('../utils/middleware');

// Apply token and user extraction middleware to all routes
emotionLogRouter.use(tokenExtractor);
emotionLogRouter.use(userExtractor);

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.token || !req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  next();
};

// GET all emotion logs for the authenticated user
emotionLogRouter.get('/', requireAuth, async (req, res) => {
  try {
    // Parse query parameters with defaults
    const limit = parseInt(req.query.limit) || 10; // default limit is 10
    const page = parseInt(req.query.page) || 1; // default page is 1
    const skip = (page - 1) * limit;

    // Add date range filter if provided
    const dateFilter = {};
    if (req.query.startDate) {
      dateFilter.createdAt = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        $lte: new Date(req.query.endDate),
      };
    }

    // Build the query
    const query = {
      user: req.user.id,
      ...dateFilter,
    };

    // Get total count for pagination
    const totalLogs = await EmotionLog.countDocuments(query);

    // Get paginated logs
    const logs = await EmotionLog.find(query)
      .populate('user', { username: 1, name: 1 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Send response with pagination metadata
    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalLogs / limit),
        totalLogs,
        hasMore: skip + logs.length < totalLogs,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching logs' });
  }
});

// GET a specific emotion log by ID
emotionLogRouter.get('/:id', requireAuth, async (req, res) => {
  const log = await EmotionLog.findOne({
    _id: req.params.id,
    user: req.user.id,
  }).populate('user', { username: 1, name: 1 });

  if (!log) {
    return res.status(404).json({ error: 'Emotion log not found' });
  }

  res.json(log);
});

// POST a new emotion log
emotionLogRouter.post('/', requireAuth, async (req, res) => {
  const {
    primaryEmotion,
    secondaryEmotion,
    emotionIntensity,
    emotionDuration,
    triggers,
    physicalSensations,
    dailyActivities,
    location,
    peopleInvolved,
    overallDayRating,
    reflection,
    gratitude,
  } = req.body;

  // Create new emotion log
  const emotionLog = new EmotionLog({
    user: req.user.id,
    primaryEmotion,
    secondaryEmotion,
    emotionIntensity,
    emotionDuration,
    triggers,
    physicalSensations,
    dailyActivities,
    location,
    peopleInvolved,
    overallDayRating,
    reflection,
    gratitude,
  });

  const savedLog = await emotionLog.save();
  await savedLog.populate('user', { username: 1, name: 1 });
  res.status(201).json(savedLog);
});

// PUT update an emotion log
emotionLogRouter.put('/:id', requireAuth, async (req, res) => {
  // First check if the log exists and belongs to the user
  const existingLog = await EmotionLog.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!existingLog) {
    return res.status(404).json({ error: 'Emotion log not found' });
  }

  const updatedLog = await EmotionLog.findByIdAndUpdate(
    req.params.id,
    { ...req.body, user: req.user.id },
    { new: true, runValidators: true }
  ).populate('user', { username: 1, name: 1 });

  res.json(updatedLog);
});

// DELETE an emotion log
emotionLogRouter.delete('/:id', requireAuth, async (req, res) => {
  const log = await EmotionLog.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!log) {
    return res.status(404).json({ error: 'Emotion log not found' });
  }

  res.status(204).end();
});

module.exports = emotionLogRouter;
