import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOptimizationIndexes1626018000000 implements MigrationInterface {
  name = 'AddOptimizationIndexes1626018000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Appointments table indexes
    await queryRunner.query(
      `CREATE INDEX idx_appointments_employee_id_status ON appointments(employee_id, status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_appointments_date_time ON appointments(date_time DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_appointments_status ON appointments(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_appointments_client_phone ON appointments(client_phone)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_appointments_employee_date ON appointments(employee_id, date_time DESC)`,
    );

    // Financial transactions table indexes
    await queryRunner.query(
      `CREATE INDEX idx_transactions_date ON financial_transactions(date DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_employee_id ON financial_transactions(employee_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_type ON financial_transactions(type)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_employee_date ON financial_transactions(employee_id, date DESC)`,
    );

    // Users table indexes
    await queryRunner.query(
      `CREATE INDEX idx_users_email ON users(email)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_users_is_active ON users(is_active)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_employee_id_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_date_time`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_client_phone`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_employee_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_employee_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_employee_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_active`);
  }
}
