const request = require('supertest');
const app = require('../../index');
const { createTestUser, createTestListing, generateAuthToken, mongoose } = require('../../test-utils');

describe('Listings API', () => {
  describe('GET /api/listings', () => {
    it('should return all listings with pagination', async () => {
      // Create multiple listings
      await createTestListing({ title: 'Property 1' });
      await createTestListing({ title: 'Property 2' });
      await createTestListing({ title: 'Property 3' });

      const res = await request(app)
        .get('/api/listings?page=1&limit=2&language=en');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('listings');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.listings.length).toBeLessThanOrEqual(2);
    });

    it('should filter listings by language', async () => {
      await createTestListing({ language: 'en', title: 'English Property' });
      await createTestListing({ language: 'es', title: 'Spanish Property' });

      const res = await request(app)
        .get('/api/listings?language=en');

      expect(res.statusCode).toBe(200);
      expect(res.body.listings.every(listing => listing.language === 'en')).toBe(true);
    });

    it('should search listings by title', async () => {
      await createTestListing({ title: 'Beach House' });
      await createTestListing({ title: 'Mountain Cabin' });

      const res = await request(app)
        .get('/api/listings?search=beach');

      expect(res.statusCode).toBe(200);
      expect(res.body.listings.some(listing => listing.title.toLowerCase().includes('beach'))).toBe(true);
    });

    it('should filter by price range', async () => {
      await createTestListing({ price: 50 });
      await createTestListing({ price: 150 });
      await createTestListing({ price: 300 });

      const res = await request(app)
        .get('/api/listings?minPrice=100&maxPrice=200');

      expect(res.statusCode).toBe(200);
      expect(res.body.listings.every(listing => listing.price >= 100 && listing.price <= 200)).toBe(true);
    });
  });

  describe('GET /api/listings/featured', () => {
    it('should return featured listings', async () => {
      await createTestListing({ featured: true, title: 'Featured Property' });
      await createTestListing({ featured: false, title: 'Regular Property' });

      const res = await request(app)
        .get('/api/listings/featured?language=en');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('featuredListings');
      expect(Array.isArray(res.body.featuredListings)).toBe(true);
      expect(res.body.featuredListings.every(listing => listing.featured)).toBe(true);
    });
  });

  describe('GET /api/listings/search/popular', () => {
    it('should return popular listings', async () => {
      await createTestListing({ title: 'Popular Property', views: 100 });
      await createTestListing({ title: 'Less Popular Property', views: 10 });

      const res = await request(app)
        .get('/api/listings/search/popular');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('popularListings');
      expect(Array.isArray(res.body.popularListings)).toBe(true);
    });
  });

  describe('GET /api/listings/:id', () => {
    it('should return a specific listing', async () => {
      const listing = await createTestListing();

      const res = await request(app)
        .get(`/api/listings/${listing._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', listing._id.toString());
      expect(res.body).toHaveProperty('title', listing.title);
    });

    it('should return 404 for non-existent listing', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/listings/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });

    it('should handle invalid ObjectId', async () => {
      const res = await request(app).get('/api/listings/invalid-id');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/listings', () => {
    it('should create a new listing', async () => {
      const host = await createTestUser({ role: 'host' });
      const token = generateAuthToken(host);

      const listingData = {
        title: 'New Property',
        description: 'A beautiful new property',
        location: 'New City, New Country',
        city: 'New City',
        country: 'New Country',
        price: 200,
        type: 'apartment',
        latitude: 40.7128,
        longitude: -74.006,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        language: 'en'
      };

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${token}`)
        .send(listingData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Listing created successfully');
      expect(res.body).toHaveProperty('listing');
      expect(res.body.listing).toHaveProperty('_id');
      expect(res.body.listing.title).toBe(listingData.title);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/listings')
        .send({ title: 'Test' });

      expect(res.statusCode).toBe(401);
    });

    it('should require host role', async () => {
      const guest = await createTestUser({ role: 'guest' });
      const token = generateAuthToken(guest);

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test' });

      expect(res.statusCode).toBe(403);
    });

    it('should validate required fields', async () => {
      const host = await createTestUser({ role: 'host' });
      const token = generateAuthToken(host);

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/listings/:id', () => {
    it('should update a listing', async () => {
      const host = await createTestUser({ role: 'host' });
      const listing = await createTestListing({ host: host._id });
      const token = generateAuthToken(host);

      const updateData = {
        title: 'Updated Property',
        price: 250
      };

      const res = await request(app)
        .put(`/api/listings/${listing._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Listing updated successfully');
      expect(res.body.listing.title).toBe(updateData.title);
      expect(res.body.listing.price).toBe(updateData.price);
    });

    it('should require authentication', async () => {
      const listing = await createTestListing();
      const res = await request(app)
        .put(`/api/listings/${listing._id}`)
        .send({ title: 'Updated' });

      expect(res.statusCode).toBe(401);
    });

    it('should only allow host to update their own listing', async () => {
      const host1 = await createTestUser({ role: 'host' });
      const host2 = await createTestUser({ role: 'host', email: 'host2@example.com' });
      const listing = await createTestListing({ host: host1._id });
      const token = generateAuthToken(host2);

      const res = await request(app)
        .put(`/api/listings/${listing._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/listings/:id', () => {
    it('should delete a listing', async () => {
      const host = await createTestUser({ role: 'host' });
      const listing = await createTestListing({ host: host._id });
      const token = generateAuthToken(host);

      const res = await request(app)
        .delete(`/api/listings/${listing._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Listing deleted successfully');
    });

    it('should require authentication', async () => {
      const listing = await createTestListing();
      const res = await request(app).delete(`/api/listings/${listing._id}`);
      expect(res.statusCode).toBe(401);
    });

    it('should only allow host to delete their own listing', async () => {
      const host1 = await createTestUser({ role: 'host' });
      const host2 = await createTestUser({ role: 'host', email: 'host2@example.com' });
      const listing = await createTestListing({ host: host1._id });
      const token = generateAuthToken(host2);

      const res = await request(app)
        .delete(`/api/listings/${listing._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/listings/:id/availability', () => {
    it('should return listing availability', async () => {
      const listing = await createTestListing();

      const res = await request(app)
        .get(`/api/listings/${listing._id}/availability`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('available');
      expect(typeof res.body.available).toBe('boolean');
    });
  });
}); 