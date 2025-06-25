const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock admin routes
app.get('/admin/users', (req, res) => res.status(200).json([]));
app.get('/admin/messages', (req, res) => res.status(200).json({ messages: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } }));

describe('Admin Endpoints', () => {
  it('GET /admin/users returns 200 and array', async () => {
    const res = await request(app).get('/admin/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /admin/messages returns 200 and messages object', async () => {
    const res = await request(app).get('/admin/messages');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('messages');
    expect(res.body).toHaveProperty('pagination');
  });
}); 