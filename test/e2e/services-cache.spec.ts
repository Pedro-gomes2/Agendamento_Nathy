import request from 'supertest';
import { initializeTestApp, TestContext } from './common';

describe('Services Caching E2E', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await initializeTestApp();
  });

  afterAll(async () => {
    await context.app.close();
  });

  describe('Services Cache', () => {
    it('should cache services on first call to findAll', async () => {
      // First call - should fetch from database
      const response1 = await request(context.app.getHttpServer())
        .get('/services')
        .expect(200);

      expect(Array.isArray(response1.body)).toBe(true);

      // Second call - should come from cache (same response)
      const response2 = await request(context.app.getHttpServer())
        .get('/services')
        .expect(200);

      expect(response2.body).toEqual(response1.body);
    });

    it('should invalidate cache when creating a service', async () => {
      const response1 = await request(context.app.getHttpServer())
        .get('/services')
        .expect(200);

      const initialCount = response1.body.length;

      // Create a new service
      await request(context.app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${context.adminToken}`)
        .send({
          name: 'New Cached Service',
          description: 'Test cache invalidation',
          price: 99.99,
          duration: 60,
        })
        .expect(201);

      // Fetch services again - should be fresh from database
      const response2 = await request(context.app.getHttpServer())
        .get('/services')
        .expect(200);

      // Should have one more service than before
      expect(response2.body.length).toBe(initialCount + 1);
    });

    it('should invalidate cache when updating a service', async () => {
      const services = await request(context.app.getHttpServer())
        .get('/services')
        .expect(200);

      const serviceId = services.body[0]?.id;
      if (!serviceId) return;

      // Update service (use PUT, not PATCH)
      await request(context.app.getHttpServer())
        .put(`/services/${serviceId}`)
        .set('Authorization', `Bearer ${context.adminToken}`)
        .send({
          name: 'Updated Service Name',
        })
        .expect(200);

      // Fetch services again - should reflect the update
      const updatedServices = await request(context.app.getHttpServer())
        .get('/services')
        .expect(200);

      const updatedService = updatedServices.body.find(s => s.id === serviceId);
      expect(updatedService.name).toBe('Updated Service Name');
    });

    it('should invalidate cache when deleting a service', async () => {
      const response1 = await request(context.app.getHttpServer())
        .get('/services')
        .expect(200);

      const initialCount = response1.body.length;
      const serviceId = response1.body[0]?.id;

      if (!serviceId) return;

      // Delete service
      await request(context.app.getHttpServer())
        .delete(`/services/${serviceId}`)
        .set('Authorization', `Bearer ${context.adminToken}`)
        .expect(200);

      // Fetch services again - should have one less
      const response2 = await request(context.app.getHttpServer())
        .get('/services')
        .expect(200);

      expect(response2.body.length).toBe(initialCount - 1);
    });
  });
});
