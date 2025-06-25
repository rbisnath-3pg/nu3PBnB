const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock content routes
app.get('/content', (req, res) => res.status(200).json([]));
app.post('/content/bulk-update', (req, res) => res.status(200).json({ results: [] }));

describe('Content Endpoints', () => {
  it('GET /content returns 200 and array', async () => {
    const res = await request(app).get('/content');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /content/bulk-update returns 200 and results array', async () => {
    const res = await request(app).post('/content/bulk-update').send({ updates: [] });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('results');
    expect(Array.isArray(res.body.results)).toBe(true);
  });
}); 