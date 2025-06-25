const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock messages routes
app.get('/messages', (req, res) => res.status(200).json({ messages: [] }));
app.post('/messages', (req, res) => res.status(201).json({ message: 'Message sent successfully', data: {} }));

// Delete message
app.delete('/messages/:id', (req, res) => res.status(200).json({ message: 'Message deleted' }));

describe('Messages Endpoints', () => {
  it('GET /messages returns 200 and messages array', async () => {
    const res = await request(app).get('/messages');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('messages');
    expect(Array.isArray(res.body.messages)).toBe(true);
  });

  it('POST /messages returns 201 and message sent', async () => {
    const res = await request(app).post('/messages').send({});
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Message sent successfully');
  });

  it('DELETE /messages/:id returns 200 and message deleted', async () => {
    const res = await request(app).delete('/messages/123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Message deleted');
  });
}); 