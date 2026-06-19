import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/modules/auth/entities/user.entity';
import { Service } from '@/modules/services/entities/service.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  client_name: string;

  @Column({ type: 'varchar', length: 20 })
  client_phone: string;

  @Column({
    type: process.env.DATABASE_TYPE === 'sqlite' ? 'datetime' : 'timestamp',
  })
  date_time: Date;

  @Column({
    type: process.env.DATABASE_TYPE === 'sqlite' ? 'varchar' : 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'uuid', nullable: true })
  employee_id: string;

  @ManyToOne(() => Service, (service) => service.appointments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'uuid', nullable: true })
  service_id: string;
}
