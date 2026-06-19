import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '@/modules/auth/entities/user.entity';
import { Service } from '@/modules/services/entities/service.entity';
import { AuthService } from '@/modules/auth/services/auth.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { CreateServiceDto } from '../dto/create-service.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    private authService: AuthService,
  ) {}

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado no sistema');
    }

    if (!createEmployeeDto.password || createEmployeeDto.password.length < 6) {
      throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
    }

    const hashedPassword = await this.authService.hashPassword(createEmployeeDto.password);

    const employee = new User();
    employee.name = createEmployeeDto.name;
    employee.email = createEmployeeDto.email;
    employee.password = hashedPassword;
    employee.role = UserRole.EMPLOYEE;
    employee.specialty = createEmployeeDto.specialty || undefined;
    employee.image_url = createEmployeeDto.photo_url || undefined;
    employee.commission_rate = createEmployeeDto.commission_percentage || 0;
    employee.is_active = true;

    await this.usersRepository.save(employee);

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      specialty: employee.specialty,
      commission_rate: employee.commission_rate,
      created_at: employee.created_at,
    };
  }

  async updateEmployee(employeeId: string, updateData: Partial<CreateEmployeeDto>) {
    const employee = await this.usersRepository.findOne({ where: { id: employeeId } });

    if (!employee) {
      throw new BadRequestException('Funcionária não encontrada');
    }

    if (updateData.email && updateData.email !== employee.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingEmail) {
        throw new ConflictException('E-mail já cadastrado');
      }
      employee.email = updateData.email;
    }

    if (updateData.name) employee.name = updateData.name;
    if (updateData.specialty !== undefined) employee.specialty = updateData.specialty;
    if (updateData.photo_url !== undefined) employee.image_url = updateData.photo_url;
    if (updateData.commission_percentage !== undefined)
      employee.commission_rate = updateData.commission_percentage;

    if (updateData.password) {
      employee.password = await this.authService.hashPassword(updateData.password);
    }

    await this.usersRepository.save(employee);

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      specialty: employee.specialty,
      commission_rate: employee.commission_rate,
    };
  }

  async deleteEmployee(employeeId: string) {
    const employee = await this.usersRepository.findOne({ where: { id: employeeId } });

    if (!employee) {
      throw new BadRequestException('Funcionária não encontrada');
    }

    await this.usersRepository.remove(employee);
    return { message: 'Funcionária removida com sucesso' };
  }

  async listEmployees() {
    const employees = await this.usersRepository.find({
      where: { role: UserRole.EMPLOYEE },
      select: ['id', 'name', 'email', 'specialty', 'image_url', 'commission_rate', 'is_active', 'created_at'],
    });

    return employees;
  }

  async createService(createServiceDto: CreateServiceDto) {
    const service = new Service();
    service.name = createServiceDto.name;
    service.description = createServiceDto.description || undefined;
    service.price = createServiceDto.price;
    service.duration = createServiceDto.duration_minutes || 60;
    service.image_url = createServiceDto.image_url || undefined;
    service.is_active = true;

    await this.servicesRepository.save(service);

    return service;
  }

  async updateService(serviceId: string, updateData: Partial<CreateServiceDto>) {
    const service = await this.servicesRepository.findOne({ where: { id: serviceId } });

    if (!service) {
      throw new BadRequestException('Serviço não encontrado');
    }

    Object.assign(service, updateData);
    await this.servicesRepository.save(service);

    return service;
  }

  async deleteService(serviceId: string) {
    const service = await this.servicesRepository.findOne({ where: { id: serviceId } });

    if (!service) {
      throw new BadRequestException('Serviço não encontrado');
    }

    await this.servicesRepository.remove(service);
    return { message: 'Serviço removido com sucesso' };
  }

  async listServices() {
    return this.servicesRepository.find({
      where: { is_active: true },
    });
  }
}
