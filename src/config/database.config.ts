import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Service } from '../entities/service.entity';
import { Appointment } from '../entities/appointment.entity';
import { FinancialTransaction } from '../entities/financial-transaction.entity';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const entities = [User, Service, Appointment, FinancialTransaction];

  // Use SQLite in-memory for tests
  if (process.env.DATABASE_TYPE === 'sqlite') {
    return {
      type: 'sqlite',
      database: ':memory:',
      entities,
      synchronize: true,
      dropSchema: true,
      logging: false,
      extra: {
        busyTimeout: 5000,
      },
    } as TypeOrmModuleOptions;
  }

  const baseConfig = {
    type: 'postgres' as const,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'salao_nathy',
    entities,
    migrations: ['dist/migrations/*.js'],
    migrationsRun: true,
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
  };

  if (process.env.DATABASE_SSL === 'true') {
    return {
      ...baseConfig,
      ssl: {
        rejectUnauthorized: false,
      },
    } as TypeOrmModuleOptions;
  }

  return baseConfig as TypeOrmModuleOptions;
};
