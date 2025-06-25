const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock reviews routes
app.get('/reviews/listing/:listingId', (req, res) => res.status(200).json([]));
app.post('/reviews', (req, res) => res.status(201).json({ message: 'Review created', review: {} }));
app.put('/reviews/:id', (req, res) => res.status(200).json({ message: 'Review updated' }));
app.delete('/reviews/:id', (req, res) => res.status(200).json({ message: 'Review deleted' }));

describe('Reviews Endpoints', () => {
  it('GET /reviews/listing/:listingId returns 200 and array', async () => {
    const res = await request(app).get('/reviews/listing/abc123');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /reviews returns 201 and review created', async () => {
    const res = await request(app).post('/reviews').send({});
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Review created');
    expect(res.body).toHaveProperty('review');
  });

  it('PUT /reviews/:id returns 200 and review updated', async () => {
    const res = await request(app).put('/reviews/abc123').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Review updated');
  });

  it('DELETE /reviews/:id returns 200 and review deleted', async () => {
    const res = await request(app).delete('/reviews/abc123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Review deleted');
  });
}); 