import request from 'supertest';
import { initializeTestApp, TestContext, generateAuthHeader } from './common';

describe('Appointments E2E (Role-Based Access Control)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await initializeTestApp();
  });

  afterAll(async () => {
    await context.app.close();
  });

  describe('Employee Access Control', () => {
    it('should block employee from accessing /financial endpoints (403)', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/financial/transactions')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should block employee from registering another employee (403)', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/auth/register-employee')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .send({
          name: 'Nova Funcionária',
          email: 'nova@salao.com',
          password: 'password123',
          specialty: 'Manicure',
          commission_rate: 20,
        })
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should block employee from creating services (403)', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/services')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .send({
          name: 'New Service',
          price: 100,
          duration: 60,
        })
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should return ONLY employee own appointments when calling GET /appointments/my-appointments', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/appointments/my-appointments')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      const employeeId = context.testData.employees[0].id;
      const employeeAppointments = response.body.filter(
        apt => apt.employee_id === employeeId,
      );

      expect(response.body.length).toBe(employeeAppointments.length);
      expect(response.body.every(apt => apt.employee_id === employeeId)).toBe(true);
    });

    it('should block employee from seeing other employees appointments (403)', async () => {
      const otherEmployeeId = context.testData.employees[1].id;
      const response = await request(context.app.getHttpServer())
        .get(`/appointments/employee/${otherEmployeeId}`)
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should allow employee to get own profile', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/users/profile')
        .set(generateAuthHeader(context.employeeTokens[0]))
        .expect(200);

      expect(response.body.email).toBe(context.testData.employees[0].email);
      expect(response.body.role).toBe('employee');
    });
  });

  describe('Admin Master Schedule (All Appointments)', () => {
    it('should return all appointments for admin', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/appointments')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(context.testData.appointments.length);
    });

    it('should return all 6 employees appointments in single request', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/appointments')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      const uniqueEmployeeIds = new Set(
        response.body.map(apt => apt.employee_id),
      );

      expect(uniqueEmployeeIds.size).toBe(6);
    });

    it('should filter appointments by status (admin)', async () => {
      const response = await request(context.app.getHttpServer())
        .get('/appointments?status=completed')
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body.every(apt => apt.status === 'completed')).toBe(true);
    });

    it('should allow admin to confirm appointment', async () => {
      const appointmentId = context.testData.appointments[0].id;
      const response = await request(context.app.getHttpServer())
        .patch(`/appointments/${appointmentId}/confirm`)
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('should allow admin to complete appointment', async () => {
      const appointmentId = context.testData.appointments[1].id;
      const response = await request(context.app.getHttpServer())
        .patch(`/appointments/${appointmentId}/complete`)
        .set(generateAuthHeader(context.adminToken))
        .expect(200);

      expect(response.body.status).toBe('completed');
    });
  });

  describe('Public Appointment Creation', () => {
    it('should allow public appointment creation without token', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/appointments')
        .send({
          client_name: 'João Silva',
          client_phone: '+5583999999999',
          date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          employee_id: context.testData.employees[0].id,
          service_id: context.testData.services[0].id,
          notes: 'Test appointment',
        })
        .expect(201);

      expect(response.body.client_name).toBe('João Silva');
      expect(response.body.status).toBe('pending');
    });

    it('should reject appointment with invalid employee_id', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/appointments')
        .send({
          client_name: 'João Silva',
          client_phone: '+5583999999999',
          date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          employee_id: '00000000-0000-0000-0000-000000000000',
          service_id: context.testData.services[0].id,
        })
        .expect(404);
    });

    it('should prevent double booking same employee same time', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await request(context.app.getHttpServer())
        .post('/appointments')
        .send({
          client_name: 'Cliente 1',
          client_phone: '+5583999999991',
          date_time: futureDate,
          employee_id: context.testData.employees[0].id,
          service_id: context.testData.services[0].id,
        })
        .expect(201);

      const response = await request(context.app.getHttpServer())
        .post('/appointments')
        .send({
          client_name: 'Cliente 2',
          client_phone: '+5583999999992',
          date_time: futureDate,
          employee_id: context.testData.employees[0].id,
          service_id: context.testData.services[1].id,
        })
        .expect(409);

      expect(response.body.message).toContain('conflict');
    });
  });
});
