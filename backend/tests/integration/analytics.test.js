const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const {
  generateTestUser,
  generateTestEmotionLogs,
  cleanupTestData,
} = require('../helpers/testDataGenerator');

const api = supertest(app);

describe('Analytics API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await cleanupTestData();
    const user = await generateTestUser();
    userId = user._id;

    // Login to get token
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'testuser', password: 'TestPass123!' });

    token = loginResponse.body.token;

    // Generate test emotion logs
    await generateTestEmotionLogs(userId);
  });

  describe('GET /api/analytics/distribution', () => {
    test('returns emotion distribution for last month', async () => {
      const response = await api
        .get('/api/analytics/distribution')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toHaveProperty('distribution');
      expect(response.body).toHaveProperty('timeline');
      expect(Object.keys(response.body.distribution).length).toBeGreaterThan(0);
      expect(response.body.timeline.length).toBeGreaterThan(0);
    });

    test('returns data for specified time range', async () => {
      const response = await api
        .get('/api/analytics/distribution?timeRange=week')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoTime = weekAgo.getTime();

      response.body.timeline.forEach((entry) => {
        const entryDate = new Date(entry.date).getTime();
        expect(entryDate).toBeGreaterThan(weekAgoTime);
      });
    });
  });

  describe('GET /api/analytics/patterns', () => {
    test('returns daily patterns and activity impact', async () => {
      const response = await api
        .get('/api/analytics/patterns')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('dailyPatterns');
      expect(response.body).toHaveProperty('activityImpact');
      expect(Object.keys(response.body.dailyPatterns).length).toBeGreaterThan(
        0
      );
    });
  });

  describe('GET /api/analytics/wellness', () => {
    test('returns wellness insights', async () => {
      const response = await api
        .get('/api/analytics/wellness')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('physicalSensations');
      expect(response.body).toHaveProperty('locationImpact');
      expect(response.body.physicalSensations).toHaveProperty('frequency');
      expect(response.body.physicalSensations).toHaveProperty(
        'emotionCorrelation'
      );
    });
  });

  describe('GET /api/analytics/activities', () => {
    test('returns comprehensive activity analysis', async () => {
      const response = await api
        .get('/api/analytics/activities')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const activities = Object.values(response.body);
      expect(activities.length).toBeGreaterThan(0);

      activities.forEach((activity) => {
        expect(activity).toHaveProperty('averageMoodRating');
        expect(activity).toHaveProperty('averageIntensity');
        expect(activity).toHaveProperty('totalOccurrences');
        expect(activity).toHaveProperty('emotionDistribution');
      });
    });
  });

  describe('Authentication tests', () => {
    test('fails without token', async () => {
      await api.get('/api/analytics/distribution').expect(401);
    });

    test('fails with invalid token', async () => {
      await api
        .get('/api/analytics/distribution')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });

  afterAll(async () => {
    // await cleanupTestData();
    await mongoose.connection.close();
  });
});
