const request = require('supertest');
const app = require('../../index');
const { createTestUser, createTestListing, createTestBooking, generateAuthToken, mongoose } = require('../../test-utils');

describe('Payments API', () => {
  describe('POST /api/payments/process', () => {
    it('should process a payment successfully', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: 300,
        paymentMethod: 'credit_card',
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvv: '123'
      };

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Payment processed successfully and booking approved');
      expect(res.body).toHaveProperty('payment');
      expect(res.body.payment).toHaveProperty('_id');
      expect(res.body.payment).toHaveProperty('paymentStatus', 'completed');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/payments/process')
        .send({});

      expect(res.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate booking exists', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);
      const fakeId = new mongoose.Types.ObjectId();

      const paymentData = {
        bookingId: fakeId.toString(),
        amount: 300,
        paymentMethod: 'credit_card'
      };

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      expect(res.statusCode).toBe(200);
    });

    it('should validate payment amount', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: -100, // Invalid amount
        paymentMethod: 'credit_card'
      };

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/payments/history', () => {
    it('should return user payment history', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);

      const res = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('payments');
      expect(Array.isArray(res.body.payments)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/payments/history');
      expect(res.statusCode).toBe(401);
    });

    it('should support pagination', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);

      const res = await request(app)
        .get('/api/payments/history?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page', 1);
      expect(res.body.pagination).toHaveProperty('limit', 10);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should return specific payment details', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      // Create a payment first
      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: 300,
        paymentMethod: 'credit_card'
      };

      const createRes = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      const paymentId = createRes.body.payment._id;

      // Get payment details
      const res = await request(app)
        .get(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.payment).toHaveProperty('_id', paymentId);
      expect(res.body.payment).toHaveProperty('amount', 300);
    });

    it('should require authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/payments/${fakeId}`);
      expect(res.statusCode).toBe(401);
    });

    it('should return 404 for non-existent payment', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/payments/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/payments/refund', () => {
    it('should process a refund', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      // Create a payment first
      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: 300,
        paymentMethod: 'credit_card'
      };

      const createRes = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      const paymentId = createRes.body.payment._id;

      // Process refund
      const refundData = {
        paymentId: paymentId,
        amount: 150,
        reason: 'Partial refund requested'
      };

      const res = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${token}`)
        .send(refundData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Refund processed successfully');
      expect(res.body).toHaveProperty('refund');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/payments/refund')
        .send({});

      expect(res.statusCode).toBe(401);
    });

    it('should validate refund amount', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      // Create a payment first
      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: 300,
        paymentMethod: 'credit_card'
      };

      const createRes = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      const paymentId = createRes.body.payment._id;

      // Try to refund more than paid
      const refundData = {
        paymentId: paymentId,
        amount: 500, // More than original payment
        reason: 'Refund requested'
      };

      const res = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${token}`)
        .send(refundData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Payment Methods', () => {
    it('should support credit card payments', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: 300,
        paymentMethod: 'credit_card',
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvv: '123'
      };

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      expect(res.statusCode).toBe(200);
      expect(res.body.payment).toHaveProperty('paymentMethod', 'credit_card');
    });

    it('should support PayPal payments', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: 300,
        paymentMethod: 'paypal',
        paypalEmail: 'test@example.com'
      };

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      expect(res.statusCode).toBe(200);
      expect(res.body.payment).toHaveProperty('paymentMethod', 'paypal');
    });

    it('should reject invalid payment method', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: 300,
        paymentMethod: 'invalid_method'
      };

      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Payment Security', () => {
    it('should not return sensitive payment data', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const listing = await createTestListing();
      const token = generateAuthToken(guest);

      const paymentData = {
        bookingId: (await createTestBooking({ guest: guest._id, listing: listing._id }))._id.toString(),
        amount: 300,
        paymentMethod: 'credit_card',
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvv: '123'
      };

      const createRes = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData);

      const paymentId = createRes.body.payment._id;

      // Get payment details
      const res = await request(app)
        .get(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.payment).not.toHaveProperty('cardNumber');
      expect(res.body.payment).not.toHaveProperty('cvv');
    });
  });
}); 