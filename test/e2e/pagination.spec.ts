import request from 'supertest';
import { initializeTestApp, TestContext, generateAuthHeader } from './common';

describe('Pagination E2E', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await initializeTestApp();
  });

  afterAll(async () => {
    await context.app.close();
  });

  describe('Services Pagination', () => {
    it('should return paginated services with default pagination', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/services/list/paginated')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('pages');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect page parameter', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/services/list/paginated?page=1&limit=5')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should respect limit parameter', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/services/list/paginated?limit=10')
        .expect(200);

      expect(response.body.limit).toBe(10);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Appointments Pagination', () => {
    it('should return paginated appointments (admin only)', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/appointments/list/paginated')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('pages');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should block employee from accessing paginated appointments', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/appointments/list/paginated')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    it('should calculate pages correctly', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/appointments/list/paginated?page=1&limit=5')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      const expectedPages = Math.ceil(response.body.total / 5);
      expect(response.body.pages).toBe(expectedPages);
    });
  });

  describe('Financial Pagination', () => {
    it('should return paginated financial transactions (admin only)', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/transactions/list/paginated')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('pages');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should block employee from accessing paginated financial', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/transactions/list/paginated')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    it('should support sorting', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/transactions/list/paginated?sortBy=created_at&sortOrder=ASC')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });
});
