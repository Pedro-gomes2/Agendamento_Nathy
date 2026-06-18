import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });
process.env.DATABASE_TYPE = 'sqlite';

let testDatabase: DataSource;

beforeAll(async () => {
  const AppDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: ['src/**/*.entity.ts'],
    synchronize: true,
    dropSchema: true,
    logging: false,
    extra: {
      // SQLite options
      busyTimeout: 5000,
    },
  });

  testDatabase = await AppDataSource.initialize();
  global.testDatabase = testDatabase;

  console.log('✅ Test database (SQLite in-memory) initialized');
});

afterAll(async () => {
  if (testDatabase && testDatabase.isInitialized) {
    await testDatabase.destroy();
    console.log('✅ Test database closed');
  }
});

afterEach(async () => {
  if (testDatabase && testDatabase.isInitialized) {
    const entities = testDatabase.entityMetadatas;
    for (const entity of entities) {
      const repository = testDatabase.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    }
  }
});
