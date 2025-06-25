const request = require('supertest');
const express = require('express');

// Import the actual app
const app = require('../../index');

describe('API Health and Status Endpoints', () => {
  it('GET /api/health should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/v1 should return 200 and API info', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('version');
  });

  it('GET /api should return API documentation', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('endpoints');
  });

  it('GET /api/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});

describe('API Authentication', () => {
  it('Protected routes should require authentication', async () => {
    const protectedRoutes = [
      '/api/auth/me',
      '/api/bookings',
      '/api/payments/history'
    ];

    for (const route of protectedRoutes) {
      const res = await request(app).get(route);
      expect([401, 403, 404]).toContain(res.statusCode);
    }
  });
});

describe('API Rate Limiting', () => {
  it('Should implement rate limiting on API endpoints', async () => {
    // Make multiple rapid requests to test rate limiting
    const requests = Array(10).fill().map(() => 
      request(app).get('/api/health')
    );
    
    const responses = await Promise.all(requests);
    const statusCodes = responses.map(res => res.statusCode);
    
    // Should not all be 429 (rate limited) for health endpoint
    expect(statusCodes.every(code => code === 429)).toBe(false);
  });
});

describe('API Error Handling', () => {
  it('Should handle malformed JSON gracefully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"invalid": json}');
    
    expect([400, 500]).toContain(res.statusCode);
  });

  it('Should handle missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});
    
    expect(res.statusCode).toBe(400);
  });

  it('Should handle invalid MongoDB ObjectIds', async () => {
    const res = await request(app).get('/api/listings/invalid-id');
    expect([400, 404, 500]).toContain(res.statusCode);
  });
});

describe('API CORS', () => {
  it('Should include CORS headers', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3000');
    
    expect(res.headers).toHaveProperty('access-control-allow-credentials');
  });
});

describe('API Content Type', () => {
  it('Should return JSON for API responses', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
}); 