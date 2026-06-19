import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './modules/auth/entities/user.entity';
import { Service } from './modules/services/entities/service.entity';
import { Appointment } from './modules/appointments/entities/appointment.entity';
import { FinancialTransaction } from './modules/financial/entities/financial-transaction.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'salao_nathy',
  entities: [User, Service, Appointment, FinancialTransaction],
  migrations: ['src/migrations/*.ts'],
  logging: process.env.DATABASE_LOGGING === 'true',
  ssl:
    process.env.DATABASE_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
