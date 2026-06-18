import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { User } from '../entities/user.entity';
import { Service } from '../entities/service.entity';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentDto } from './dtos/update-appointment.dto';
import { PaginationDto, PaginatedResponse } from '../common/dtos/pagination.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const employee = await this.usersRepository.findOne({
      where: { id: createAppointmentDto.employee_id },
    });

    if (!employee) {
      throw new NotFoundException('Funcionária não encontrada');
    }

    const service = await this.servicesRepository.findOne({
      where: { id: createAppointmentDto.service_id },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    const appointmentDateTime = new Date(createAppointmentDto.date_time);
    if (appointmentDateTime < new Date()) {
      throw new ConflictException(
        'Data e hora do agendamento não pode ser no passado',
      );
    }

    const existingAppointment = await this.appointmentsRepository.findOne({
      where: [
        {
          employee_id: createAppointmentDto.employee_id,
          date_time: appointmentDateTime,
          status: AppointmentStatus.CONFIRMED,
        },
        {
          employee_id: createAppointmentDto.employee_id,
          date_time: appointmentDateTime,
          status: AppointmentStatus.PENDING,
        },
      ],
    });

    if (existingAppointment) {
      throw new ConflictException(
        'Funcionária já possui agendamento neste horário - conflict',
      );
    }

    const appointment = this.appointmentsRepository.create({
      client_name: createAppointmentDto.client_name,
      client_phone: createAppointmentDto.client_phone,
      date_time: appointmentDateTime,
      employee_id: createAppointmentDto.employee_id,
      service_id: createAppointmentDto.service_id,
      notes: createAppointmentDto.notes || null,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['employee', 'service'],
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return appointment;
  }

  async findByEmployee(employeeId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { employee_id: employeeId },
      relations: ['employee', 'service'],
      order: { date_time: 'DESC' },
    });
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      relations: ['employee', 'service'],
      order: { date_time: 'DESC' },
    });
  }

  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<Appointment>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const orderObj: any = {};
    const allowedSortFields = ['id', 'client_name', 'date_time', 'status', 'created_at', 'updated_at'];
    const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'created_at';
    orderObj[sortBy] = pagination.sortOrder || 'DESC';

    const [appointments, total] = await this.appointmentsRepository.findAndCount({
      relations: ['employee', 'service'],
      skip,
      take: pagination.limit,
      order: orderObj,
    });

    return {
      data: appointments,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    };
  }

  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { status },
      relations: ['employee', 'service'],
      order: { date_time: 'DESC' },
    });
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (updateAppointmentDto.date_time) {
      const newDateTime = new Date(updateAppointmentDto.date_time);
      if (newDateTime < new Date()) {
        throw new ConflictException('Data não pode ser no passado');
      }
      appointment.date_time = newDateTime;
    }

    if (updateAppointmentDto.status)
      appointment.status = updateAppointmentDto.status;
    if (updateAppointmentDto.notes !== undefined)
      appointment.notes = updateAppointmentDto.notes;

    return this.appointmentsRepository.save(appointment);
  }

  async cancel(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentsRepository.save(appointment);
  }

  async complete(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.COMPLETED;
    return this.appointmentsRepository.save(appointment);
  }

  async delete(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }
}
