import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from '@/modules/appointments/entities/appointment.entity';
import { FinancialTransaction } from '@/modules/financial/entities/financial-transaction.entity';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: process.env.DATABASE_TYPE === 'sqlite' ? 'varchar' : 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialty: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  commission_rate: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.employee)
  appointments: Appointment[];

  @OneToMany(
    () => FinancialTransaction,
    (transaction) => transaction.employee,
  )
  financial_transactions: FinancialTransaction[];
}
