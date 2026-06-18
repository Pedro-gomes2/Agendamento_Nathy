import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

@Entity('financial_transactions')
export class FinancialTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: process.env.DATABASE_TYPE === 'sqlite' ? 'varchar' : 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({
    type: process.env.DATABASE_TYPE === 'sqlite' ? 'datetime' : 'timestamp',
    default: () =>
      process.env.DATABASE_TYPE === 'sqlite' ? 'CURRENT_TIMESTAMP' : 'now()',
  })
  date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.financial_transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'uuid', nullable: true })
  employee_id: string;
}
