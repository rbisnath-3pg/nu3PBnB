const request = require('supertest');
const app = require('../../index');
const { createTestUser, createTestListing, createTestBooking, generateAuthToken, mongoose } = require('../../test-utils');

describe('Bookings API', () => {
  describe('POST /api/bookings', () => {
    it('should create a new booking request', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      const bookingData = {
        listingId: listing._id.toString(),
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        guests: 2,
        message: 'Test booking request'
      };

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Booking request created successfully');
      expect(res.body).toHaveProperty('booking');
      expect(res.body.booking).toHaveProperty('_id');
      expect(res.body.booking.status).toBe('pending');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({});

      expect(res.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate listing exists', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);
      const fakeId = new mongoose.Types.ObjectId();

      const bookingData = {
        listingId: fakeId.toString(),
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        guests: 2
      };

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.statusCode).toBe(404);
    });

    it('should validate date range', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      const bookingData = {
        listingId: listing._id.toString(),
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // End before start
        guests: 2
      };

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/bookings', () => {
    it('should return user bookings for guest', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);

      const res = await request(app)
        .get('/api/bookings?role=guest')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bookings');
      expect(Array.isArray(res.body.bookings)).toBe(true);
    });

    it('should return user bookings for host', async () => {
      const host = await createTestUser({ role: 'host' });
      const token = generateAuthToken(host);

      const res = await request(app)
        .get('/api/bookings/host')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bookings');
      expect(Array.isArray(res.body.bookings)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/bookings/listing/:listingId', () => {
    it('should return bookings for a specific listing', async () => {
      const listing = await createTestListing();

      const res = await request(app)
        .get(`/api/bookings/listing/${listing._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bookings');
      expect(Array.isArray(res.body.bookings)).toBe(true);
    });

    it('should handle invalid listing ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/bookings/listing/${fakeId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.bookings).toHaveLength(0);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update booking status', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const host = await createTestUser({ role: 'host', email: 'host@example.com' });
      const listing = await createTestListing({ host: host._id });
      const guestToken = generateAuthToken(guest);
      const hostToken = generateAuthToken(host);

      // Create a booking first
      const bookingData = {
        listingId: listing._id.toString(),
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        guests: 2
      };

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(bookingData);

      const bookingId = createRes.body.booking._id;

      // Update the booking as host
      const updateData = {
        status: 'confirmed',
        message: 'Updated message'
      };

      const res = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Booking updated successfully');
    });

    it('should require authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/bookings/${fakeId}`)
        .send({ status: 'confirmed' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should delete a booking', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      // Create a booking first
      const bookingData = {
        listingId: listing._id.toString(),
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        guests: 2
      };

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      const bookingId = createRes.body.booking._id;

      // Delete the booking
      const res = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Booking deleted successfully');
    });

    it('should require authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/bookings/${fakeId}`);
      expect(res.statusCode).toBe(401);
    });
  });
}); 