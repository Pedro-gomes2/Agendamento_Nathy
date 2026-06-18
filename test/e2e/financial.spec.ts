import request from 'supertest';
import { initializeTestApp, TestContext, generateAuthHeader } from './common';

describe('Financial E2E (Commission & Revenue Calculations)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await initializeTestApp();
  });

  afterAll(async () => {
    await context.app.close();
  });

  describe('Employee Financial Access Control', () => {
    it('should block employee from accessing global transactions (403)', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/transactions')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should block employee from accessing global report (403)', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/report/all')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should allow employee to access own financials', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/my-financials')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every(
          t => t.employee_id === context.testData.employees[0].id,
        ),
      ).toBe(true);
    });
  });

  describe('Admin Commission Calculation', () => {
    it('should calculate correct total revenue for completed appointments', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/report/all')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      const totalRevenue = response.body.total_entries;
      const completedAppointments = context.testData.appointments.filter(
        a => a.status === 'completed',
      );
      const expectedRevenue = completedAppointments.reduce(
        (sum, apt) => sum + apt.service.price,
        0,
      );

      expect(totalRevenue).toBe(expectedRevenue);
    });

    it('should calculate correct total expenses', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/report/all')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      const totalExpenses = response.body.total_exits;
      const expectedExpenses = context.testData.transactions
        .filter(t => t.type === 'exit')
        .reduce((sum, t) => sum + t.value, 0);

      expect(totalExpenses).toBe(expectedExpenses);
    });

    it('should calculate employee commission correctly (percentage-based)', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/commissions/all')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      for (const commission of response.body) {
        const employee = context.testData.employees.find(
          e => e.id === commission.employee_id,
        );
        const employeeAppointments = context.testData.appointments.filter(
          a => a.employee_id === employee.id && a.status === 'completed',
        );

        const totalRevenue = employeeAppointments.reduce(
          (sum, apt) => sum + apt.service.price,
          0,
        );

        const expectedCommission =
          (totalRevenue * employee.commission_rate) / 100;

        expect(commission.commission_value).toBe(expectedCommission);
      }
    });

    it('should return employee with highest commission first', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/commissions/all')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      for (let i = 0; i < response.body.length - 1; i++) {
        expect(response.body[i].commission_value).toBeGreaterThanOrEqual(
          response.body[i + 1].commission_value,
        );
      }
    });

    it('should filter financial report by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 20);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 5);

      const response = await request(context.app.getHttpServer())
        .get('/financial/report/all')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body.start_date).toBeDefined();
      expect(response.body.end_date).toBeDefined();
    });
  });

  describe('Financial Transaction CRUD', () => {
    it('should create entry transaction (admin only)', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/financial/transactions')
        .set(generateAuthHeader(context.adminToken))
        .send({
          type: 'entry',
          value: 250,
          description: 'Serviço especial - Coloração premium',
          employee_id: context.testData.employees[0].id,
        })
        .expect(201);

      expect(response.body.type).toBe('entry');
      expect(response.body.value).toBe(250);
      expect(response.body.employee_id).toBe(context.testData.employees[0].id);
    });

    it('should create exit transaction (admin only)', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/financial/transactions')
        .set(generateAuthHeader(context.adminToken))
        .send({
          type: 'exit',
          value: 150,
          description: 'Compra de produtos de higiene',
        })
        .expect(201);

      expect(response.body.type).toBe('exit');
      expect(response.body.value).toBe(150);
    });

    it('should block employee from creating transactions (403)', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/financial/transactions')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .send({
          type: 'entry',
          value: 100,
          description: 'Test',
        })
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should delete transaction (admin only)', async () => {
      const transactionId = context.testData.transactions[0].id;

      await request(context.app.getHttpServer())
        .delete(`/financial/transactions/${transactionId}`)
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      const response = await request(context.app.getHttpServer())
        .get(`/financial/transactions/${transactionId}`)
        .set(generateAuthHeader(context.adminToken))
        .expect(404);
    });

    it('should fetch single transaction (admin)', async () => {
      const transactionId = context.testData.transactions[1].id;

      const response = await request(context.app.getHttpServer())
        .get(`/financial/transactions/${transactionId}`)
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body.id).toBe(transactionId);
    });
  });

  describe('Admin CRUD Operations', () => {
    it('should create new service with image URL', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/services')
        .set(generateAuthHeader(context.adminToken))
        .send({
          name: 'Depilação Completa',
          description: 'Depilação profissional com cera aquecida',
          price: 200,
          duration: 120,
          image_url: 'https://example.com/services/depilacao.jpg',
        })
        .expect(201);

      expect(response.body.name).toBe('Depilação Completa');
      expect(response.body.price).toBe(200);
      expect(response.body.image_url).toContain('example.com');
    });

    it('should update service', async () => {
      const serviceId = context.testData.services[0].id;

      const response = await request(context.app.getHttpServer())
        .put(`/services/${serviceId}`)
        .set(generateAuthHeader(context.adminToken))
        .send({
          price: 75,
          description: 'Manicure premium com esmaltação',
        })
        .expect(200);

      expect(response.body.price).toBe(75);
    });

    it('should delete service', async () => {
      const serviceId = context.testData.services[5].id;

      await request(context.app.getHttpServer())
        .delete(`/services/${serviceId}`)
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      const response = await request(context.app.getHttpServer())
        .get(`/services/${serviceId}`)
        .expect(404);
    });

    it('should register new employee with commission rate', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/auth/register-employee')
        .set(generateAuthHeader(context.adminToken))
        .send({
          name: 'Mariana Silva',
          email: 'mariana@salao.com',
          password: 'secure_password_123',
          specialty: 'Manicure Artística',
          commission_rate: 30,
          image_url: 'https://example.com/employees/mariana.jpg',
        })
        .expect(201);

      expect(response.body.email).toBe('mariana@salao.com');
      expect(response.body.commission_rate).toBe(30);
      expect(response.body.role).toBe('employee');
    });

    it('should update employee details', async () => {
      const employeeId = context.testData.employees[0].id;

      const response = await request(context.app.getHttpServer())
        .put(`/users/${employeeId}`)
        .set(generateAuthHeader(context.adminToken))
        .send({
          commission_rate: 35,
          specialty: 'Manicure Especialista',
        })
        .expect(200);

      expect(response.body.commission_rate).toBe(35);
      expect(response.body.specialty).toBe('Manicure Especialista');
    });

    it('should deactivate employee', async () => {
      const employeeId = context.testData.employees[1].id;

      const response = await request(context.app.getHttpServer())
        .patch(`/users/${employeeId}/deactivate`)
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body.is_active).toBe(false);
    });

    it('should activate employee', async () => {
      const employeeId = context.testData.employees[1].id;

      const response = await request(context.app.getHttpServer())
        .patch(`/users/${employeeId}/activate`)
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body.is_active).toBe(true);
    });
  });
});
