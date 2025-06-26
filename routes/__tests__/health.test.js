const request = require('supertest');
const express = require('express');

// Import the actual app
const app = require('../../index');

describe('Health Check Tests', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should return JSON content type', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('should have a valid response body', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toBeDefined();
    expect(typeof res.body).toBe('object');
  });
}); 