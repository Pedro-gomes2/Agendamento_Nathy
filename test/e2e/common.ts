import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { seedTestDatabase, TestData } from '../fixtures/seed';

export interface TestContext {
  app: INestApplication;
  testData: TestData;
  adminToken: string;
  employeeTokens: string[];
}

export async function initializeTestApp(): Promise<TestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  let dataSource: DataSource;
  try {
    dataSource = moduleFixture.get<DataSource>(DataSource);
  } catch (error) {
    throw new Error(
      'DataSource not found. Make sure AppModule imports TypeOrmModule correctly.',
    );
  }

  let testData;
  try {
    testData = await seedTestDatabase(dataSource);
  } catch (error) {
    await app.close();
    throw error;
  }

  // Generate tokens
  const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only';

  const adminToken = jwt.sign(
    {
      sub: testData.admin.id,
      email: testData.admin.email,
      role: 'admin',
    },
    jwtSecret,
    { expiresIn: '7d' },
  );

  const employeeTokens = testData.employees.map(emp =>
    jwt.sign(
      {
        sub: emp.id,
        email: emp.email,
        role: 'employee',
      },
      jwtSecret,
      { expiresIn: '7d' },
    ),
  );

  return {
    app,
    testData,
    adminToken,
    employeeTokens,
  };
}

export function generateAuthHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}
