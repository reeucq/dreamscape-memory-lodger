const adviceRouter = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const EmotionLog = require('../models/emotionlog');
const { tokenExtractor, userExtractor } = require('../utils/middleware');
const validator = require('validator');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Apply authentication middleware
adviceRouter.use(tokenExtractor);
adviceRouter.use(userExtractor);

// Helper function to generate advice prompt based on emotion logs
const generatePrompt = (logs) => {
  // Extract relevant information from logs
  const recentEmotions = logs.map((log) => ({
    primaryEmotion: validator.escape(log.primaryEmotion),
    intensity: log.emotionIntensity,
    reflection: validator.escape(log.reflection || ''),
    gratitude: validator.escape(log.gratitude || ''),
    overallDayRating: log.overallDayRating,
  }));

  // Create a prompt for Gemini
  return `As an emotional well-being advisor, analyze the following emotional data and provide personalized advice (max 3 sentences):

Recent emotional patterns:
${recentEmotions
  .map(
    (e) => `
- Primary Emotion: ${e.primaryEmotion}
- Intensity: ${e.emotionIntensity}/7
- Day Rating: ${e.overallDayRating}/10
${e.reflection ? `- Reflection: ${e.reflection}` : ''}
${e.gratitude ? `- Gratitude: ${e.gratitude}` : ''}
`
  )
  .join('\n')}

Please provide concise, empathetic advice that:
1. Acknowledges their emotional state
2. Offers a specific, actionable suggestion
3. Ends with an encouraging note`;
};

// GET route to fetch personalized advice
adviceRouter.get('/', async (req, res) => {
  try {
    // Get recent emotion logs (last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentLogs = await EmotionLog.find({
      user: req.user.id,
      createdAt: { $gte: threeDaysAgo },
    }).sort({ createdAt: -1 });

    if (recentLogs.length === 0) {
      return res.status(404).json({
        message:
          'No recent emotion logs found. Log your emotions to get personalized advice.',
      });
    }

    // Generate prompt based on logs
    const prompt = generatePrompt(recentLogs);

    // Get advice from Gemini
    const result = await model.generateContent(prompt);
    const advice = result.response.text();

    // Send response
    res.json({
      advice,
      basedOn: {
        logsAnalyzed: recentLogs.length,
        dateRange: {
          from: threeDaysAgo,
          to: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error generating advice:', error); // Log detailed error
    res.status(500).json({
      error: 'Failed to generate advice. Please try again later.', // Generic message
    });
  }
});

module.exports = adviceRouter;
