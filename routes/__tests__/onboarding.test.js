const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock onboarding routes
app.get('/onboarding', (req, res) => res.status(200).json({ steps: [] }));

describe('Onboarding Endpoints', () => {
  it('GET /onboarding returns 200 and steps array', async () => {
    const res = await request(app).get('/onboarding');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('steps');
    expect(Array.isArray(res.body.steps)).toBe(true);
  });
}); 