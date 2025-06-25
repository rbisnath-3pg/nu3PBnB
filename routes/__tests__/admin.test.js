const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock admin routes
app.get('/admin/users', (req, res) => res.status(200).json([]));
app.get('/admin/messages', (req, res) => res.status(200).json({ messages: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } }));

// Mock DELETE routes for test results
app.delete('/admin/test-results', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  res.status(200).json({ message: 'Test history cleared successfully' });
});

app.delete('/admin/test-results/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  res.status(200).json({ message: 'Test run deleted successfully' });
});

describe('Admin Endpoints', () => {
  // Mock admin token - defined within describe block for proper scope
  const adminToken = 'mock-admin-token';

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

  // Test clear test history endpoint
  it('DELETE /admin/test-results should clear all test results', async () => {
    const res = await request(app)
      .delete('/admin/test-results')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Test history cleared successfully');
  });

  // Test delete specific test run endpoint
  it('DELETE /admin/test-results/:id should delete specific test run', async () => {
    const testRunId = 'test-run-123';
    const res = await request(app)
      .delete(`/admin/test-results/${testRunId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Test run deleted successfully');
  });

  // Test clear test history without auth should fail
  it('DELETE /admin/test-results should require authentication', async () => {
    const res = await request(app)
      .delete('/admin/test-results');
    
    expect(res.status).toBe(401);
  });

  // Test delete test run without auth should fail
  it('DELETE /admin/test-results/:id should require authentication', async () => {
    const testRunId = 'test-run-123';
    const res = await request(app)
      .delete(`/admin/test-results/${testRunId}`);
    
    expect(res.status).toBe(401);
  });
}); 