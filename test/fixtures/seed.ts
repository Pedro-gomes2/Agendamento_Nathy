import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../src/entities/user.entity';
import { Service } from '../../src/entities/service.entity';
import { Appointment, AppointmentStatus } from '../../src/entities/appointment.entity';
import { FinancialTransaction, TransactionType } from '../../src/entities/financial-transaction.entity';
import { v4 as uuidv4 } from 'uuid';

export interface TestData {
  admin: User;
  employees: User[];
  services: Service[];
  appointments: Appointment[];
  transactions: FinancialTransaction[];
}

export async function seedTestDatabase(dataSource: DataSource): Promise<TestData> {
  const userRepository = dataSource.getRepository(User);
  const serviceRepository = dataSource.getRepository(Service);
  const appointmentRepository = dataSource.getRepository(Appointment);
  const transactionRepository = dataSource.getRepository(FinancialTransaction);

  // Create Admin
  const adminId = uuidv4();
  const admin = userRepository.create({
    id: adminId,
    name: 'Admin Nathy',
    email: 'admin@salao.com',
    password: await bcrypt.hash('admin123456', 10),
    role: UserRole.ADMIN,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  });
  await userRepository.save(admin);

  // Create 6 Employees with different specialties
  const specialties = ['Manicure', 'Pedicure', 'Hidratação', 'Corte', 'Coloração', 'Design de Sobrancelha'];
  const employees: User[] = [];

  for (let i = 1; i <= 6; i++) {
    const employeeId = uuidv4();
    const employee = userRepository.create({
      id: employeeId,
      name: `Funcionária ${i}`,
      email: `employee${i}@salao.com`,
      password: await bcrypt.hash('password123', 10),
      role: UserRole.EMPLOYEE,
      specialty: specialties[i - 1],
      commission_rate: 20 + i * 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    employees.push(employee);
    await userRepository.save(employee);
  }

  // Create Services
  const services: Service[] = [];
  const serviceNames = [
    { name: 'Manicure', price: 50, duration: 30 },
    { name: 'Pedicure', price: 60, duration: 40 },
    { name: 'Hidratação Profunda', price: 120, duration: 60 },
    { name: 'Corte de Cabelo', price: 80, duration: 45 },
    { name: 'Coloração', price: 150, duration: 90 },
    { name: 'Design de Sobrancelha', price: 35, duration: 20 },
  ];

  for (const svc of serviceNames) {
    const serviceId = uuidv4();
    const service = serviceRepository.create({
      id: serviceId,
      name: svc.name,
      description: `Serviço profissional de ${svc.name.toLowerCase()}`,
      price: svc.price,
      duration: svc.duration,
      image_url: `https://example.com/services/${svc.name.replace(/\s+/g, '_').toLowerCase()}.jpg`,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    services.push(service);
    await serviceRepository.save(service);
  }

  // Create Appointments (past and future)
  const appointments: Appointment[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);

  for (let i = 0; i < 12; i++) {
    const appointmentId = uuidv4();
    const appointmentDate = new Date(baseDate);
    appointmentDate.setDate(appointmentDate.getDate() + i * 3);

    const appointment = appointmentRepository.create({
      id: appointmentId,
      client_name: `Cliente ${i + 1}`,
      client_phone: `+558399${String(i).padStart(6, '0')}`,
      date_time: appointmentDate,
      status: i < 8 ? AppointmentStatus.COMPLETED : AppointmentStatus.CONFIRMED,
      employee_id: employees[i % 6].id,
      employee: employees[i % 6],
      service_id: services[i % 6].id,
      service: services[i % 6],
      notes: i % 3 === 0 ? 'Cliente VIP' : null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    appointments.push(appointment);
    await appointmentRepository.save(appointment);
  }

  // Create Financial Transactions
  const transactions: FinancialTransaction[] = [];

  // Entry transactions (completed appointments)
  for (let i = 0; i < 8; i++) {
    const transactionId = uuidv4();
    const transaction = transactionRepository.create({
      id: transactionId,
      type: TransactionType.ENTRY,
      value: appointments[i].service.price,
      description: `Receita - ${appointments[i].service.name} (Cliente: ${appointments[i].client_name})`,
      date: appointments[i].date_time,
      employee_id: appointments[i].employee_id,
      employee: appointments[i].employee,
      created_at: new Date(),
    });
    transactions.push(transaction);
    await transactionRepository.save(transaction);
  }

  // Exit transaction (expenses)
  const exitId = uuidv4();
  const exitTransaction = transactionRepository.create({
    id: exitId,
    type: TransactionType.EXIT,
    value: 300,
    description: 'Despesa - Produtos de higiene',
    date: new Date(),
    created_at: new Date(),
  });
  transactions.push(exitTransaction);
  await transactionRepository.save(exitTransaction);

  return {
    admin,
    employees,
    services,
    appointments,
    transactions,
  };
}
