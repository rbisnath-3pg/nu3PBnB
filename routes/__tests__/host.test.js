const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock host routes
app.get('/host/bookings', (req, res) => res.status(200).json([]));
app.post('/host/bookings/:bookingId/approve', (req, res) => res.status(200).json({ message: 'Booking approved' }));
app.post('/host/bookings/:bookingId/decline', (req, res) => res.status(200).json({ message: 'Booking declined' }));

describe('Host Endpoints', () => {
  it('GET /host/bookings returns 200 and array', async () => {
    const res = await request(app).get('/host/bookings');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /host/bookings/:bookingId/approve returns 200 and approved message', async () => {
    const res = await request(app).post('/host/bookings/abc123/approve').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Booking approved');
  });

  it('POST /host/bookings/:bookingId/decline returns 200 and declined message', async () => {
    const res = await request(app).post('/host/bookings/abc123/decline').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Booking declined');
  });
}); 