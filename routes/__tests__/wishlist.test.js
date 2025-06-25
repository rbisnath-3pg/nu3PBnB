const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock wishlist routes
app.get('/users/:id/wishlist', (req, res) => res.status(200).json({ wishlist: [] }));
app.post('/users/:id/wishlist', (req, res) => res.status(201).json({ message: 'Added to wishlist' }));
app.delete('/users/:id/wishlist/:listingId', (req, res) => res.status(200).json({ message: 'Removed from wishlist' }));

describe('Wishlist Endpoints', () => {
  it('GET /users/:id/wishlist returns 200 and wishlist array', async () => {
    const res = await request(app).get('/users/abc123/wishlist');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('wishlist');
    expect(Array.isArray(res.body.wishlist)).toBe(true);
  });

  it('POST /users/:id/wishlist returns 201 and added message', async () => {
    const res = await request(app).post('/users/abc123/wishlist').send({});
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Added to wishlist');
  });

  it('DELETE /users/:id/wishlist/:listingId returns 200 and removed message', async () => {
    const res = await request(app).delete('/users/abc123/wishlist/def456');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Removed from wishlist');
  });
}); 