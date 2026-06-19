# 📚 Receita 09: Testes E2E com Jest e Supertest

## Objetivo
Aprender a testar endpoints completos (E2E) validando autenticação, autorização e lógica de negócio.

## O que é E2E Testing?

**E2E** = End-to-End. Testa fluxo completo:

```
Request → Controller → Service → Database → Response
  ✓         ✓          ✓        ✓         ✓
```

Diferente de testes unitários que testam função por função.

---

## Setup: Jest + Supertest

Já incluído no projeto:

```bash
npm install --save-dev @nestjs/testing jest supertest ts-jest
npm install --save-dev @types/jest @types/supertest
```

---

## Estrutura de Testes

```
test/
├── jest.config.js           # Config do Jest
├── setup.ts                 # Setup de database de teste
├── e2e/
│   ├── auth.spec.ts         # Testes de autenticação
│   ├── appointments.spec.ts  # Testes de agendamentos
│   ├── services.spec.ts      # Testes de serviços
│   ├── financial.spec.ts     # Testes financeiros
│   └── common.ts             # Helpers compartilhados
└── fixtures/
    └── seed.ts              # Dados de teste
```

---

## Teste Básico: Login

```typescript
// test/e2e/auth.spec.ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login - login com credenciais válidas', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@salao.com',
        password: 'admin123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(typeof response.body.access_token).toBe('string');
  });

  it('POST /auth/login - rejeita credenciais inválidas', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@salao.com',
        password: 'senhaerrada',
      })
      .expect(401);

    expect(response.body.message).toContain('Unauthorized');
  });

  it('POST /auth/login - rejeita email inválido (DTO validation)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'nao-eh-email',
        password: 'password123',
      })
      .expect(400);

    expect(response.body.message).toContain('email');
  });
});
```

**Estrutura:**
```typescript
describe('Grupo de testes')  // Agrupa testes relacionados
  beforeAll(async () => {})  // Roda UMA VEZ antes de todos
  beforeEach(async () => {}) // Roda antes de CADA teste
  afterEach(async () => {})  // Roda depois de CADA teste
  afterAll(async () => {})   // Roda UMA VEZ depois de todos

  it('descrição do teste', async () => {
    // Arrange (preparar)
    const data = { email: '...', password: '...' };
    
    // Act (executar)
    const response = await request(app.getHttpServer())
      .post('/endpoint')
      .send(data);
    
    // Assert (validar)
    expect(response.status).toBe(200);
    expect(response.body.access_token).toBeDefined();
  });
```

---

## Teste com Autenticação: Bloqueio de Segurança

```typescript
describe('Appointments (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Fazer login para obter tokens
    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@salao.com', password: 'admin123' });

    adminToken = adminResponse.body.access_token;

    const employeeResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'ana@salao.com', password: 'employee123' });

    employeeToken = employeeResponse.body.access_token;
  });

  it('GET /appointments - admin vê todos os agendamentos', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /appointments - funcionária vê erro 403', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/appointments')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(403);

    expect(response.body.message).toContain('Forbidden');
  });

  it('GET /appointments/my-appointments - funcionária vê apenas seus agendamentos', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/appointments/my-appointments')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    // Todos devem ter employee_id da Ana
    response.body.forEach((appt) => {
      expect(appt.employee_id).toBe(anaEmployeeId);
    });
  });
});
```

---

## Teste de Validação: Double-Booking Prevention

```typescript
describe('Appointment Creation (e2e)', () => {
  it('POST /appointments - previne double-booking', async () => {
    const appointmentData = {
      service_id: 'service-uuid',
      date_time: '2024-03-15T10:00:00Z',
      client_phone: '+55 11 98765-4321',
    };

    // Primeiro agendamento (sucesso)
    const first = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(appointmentData)
      .expect(201);

    expect(first.body.id).toBeDefined();

    // Segundo agendamento no MESMO horário (bloqueado)
    const second = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(appointmentData)
      .expect(409); // Conflict

    expect(second.body.message).toContain('já agendado');
  });
});
```

---

## Teste de Relatório Financeiro

```typescript
describe('Financial Report (e2e)', () => {
  it('GET /financial/report - calcula comissões corretamente', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/financial/report?start_date=2024-01-01&end_date=2024-12-31')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('total_revenue');
    expect(response.body).toHaveProperty('total_commission');
    expect(response.body).toHaveProperty('employees');

    // Validar cálculo
    const employee = response.body.employees[0];
    expect(employee.commission).toBe(
      (employee.revenue * employee.commission_rate) / 100,
    );
  });
});
```

---

## Executar Testes

```bash
# Rodar todos os testes
npm run test:e2e

# Rodar arquivo específico
npm run test:e2e -- appointments.spec.ts

# Rodar com cobertura (coverage)
npm run test:e2e -- --coverage

# Watch mode (reexecuta ao salvar)
npm run test:e2e -- --watch
```

---

## Helpers Compartilhados (test/e2e/common.ts)

```typescript
// test/e2e/common.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class TestHelper {
  constructor(private app: INestApplication) {}

  async login(email: string, password: string): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });

    return response.body.access_token;
  }

  async createAppointment(
    token: string,
    serviceId: string,
    dateTime: string,
    clientPhone: string,
  ) {
    return request(this.app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        service_id: serviceId,
        date_time: dateTime,
        client_phone: clientPhone,
      });
  }

  async getFinancialReport(token: string, startDate?: string, endDate?: string) {
    let query = '/api/v1/financial/report';
    if (startDate || endDate) {
      query += '?';
      if (startDate) query += `start_date=${startDate}`;
      if (endDate) query += `${startDate ? '&' : ''}end_date=${endDate}`;
    }
    return request(this.app.getHttpServer())
      .get(query)
      .set('Authorization', `Bearer ${token}`);
  }
}
```

Usar:
```typescript
const helper = new TestHelper(app);
const token = await helper.login('ana@salao.com', 'password123');
const response = await helper.createAppointment(
  token,
  'service-id',
  '2024-03-15T10:00:00Z',
  '+55 11 98765-4321',
);
```

---

## Dados de Teste (test/fixtures/seed.ts)

```typescript
// test/fixtures/seed.ts
import { Repository } from 'typeorm';
import { User } from '@/modules/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(usersRepository: Repository<User>) {
  // Criar usuários de teste
  const admin = usersRepository.create({
    email: 'admin@salao.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
    is_active: true,
  });

  const employee = usersRepository.create({
    email: 'ana@salao.com',
    password: await bcrypt.hash('employee123', 10),
    role: 'employee',
    is_active: true,
    commission_rate: 30,
  });

  await usersRepository.save([admin, employee]);
}
```

---

## Checklist: Testes Obrigatórios

- [ ] Auth: Login com sucesso
- [ ] Auth: Login com senha errada → 401
- [ ] Auth: Email inválido → 400
- [ ] Appointments: Admin vê todos
- [ ] Appointments: Employee vê só seus
- [ ] Appointments: Employee vê erro 403 em endpoint de admin
- [ ] Appointments: Previne double-booking
- [ ] Services: GET retorna cache de Redis
- [ ] Financial: Calcula comissão corretamente
- [ ] Financial: Admin vê relatório geral
- [ ] Financial: Employee vê seu relatório apenas

---

## Próximos Passos
- Ler [Receita 10: Deploy](./10_DEPLOY.md)
- Rodar: `npm run test:e2e`
- Aumentar cobertura: `npm run test:e2e -- --coverage`
