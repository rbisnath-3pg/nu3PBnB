const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock feedback routes
app.post('/feedback', (req, res) => res.status(201).json({ message: 'Feedback submitted', feedback: {} }));

describe('Feedback Endpoints', () => {
  it('POST /feedback returns 201 and feedback submitted', async () => {
    const res = await request(app).post('/feedback').send({});
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Feedback submitted');
    expect(res.body).toHaveProperty('feedback');
  });
}); 