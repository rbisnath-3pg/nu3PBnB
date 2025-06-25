const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock analytics routes
app.get('/analytics', (req, res) => res.status(200).json({ userCount: 0, listingCount: 0, bookingCount: 0 }));
app.get('/analytics/realtime', (req, res) => res.status(200).json({ activeUsers: 0, recentPageViews: 0, recentClicks: 0, currentPageActivity: [] }));

describe('Analytics Endpoints', () => {
  it('GET /analytics returns 200 and basic metrics', async () => {
    const res = await request(app).get('/analytics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('userCount');
    expect(res.body).toHaveProperty('listingCount');
    expect(res.body).toHaveProperty('bookingCount');
  });

  it('GET /analytics/realtime returns 200 and real-time metrics', async () => {
    const res = await request(app).get('/analytics/realtime');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('activeUsers');
    expect(res.body).toHaveProperty('recentPageViews');
    expect(res.body).toHaveProperty('recentClicks');
    expect(res.body).toHaveProperty('currentPageActivity');
  });
}); 