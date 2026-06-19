import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '@/modules/appointments/entities/appointment.entity';
import { PaginationDto, PaginatedResponse } from '@/common/dtos/pagination.dto';
import { MonitorPerformance } from '@/common/decorators/monitor-performance.decorator';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  @MonitorPerformance(1000)
  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<Appointment>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [appointments, total] = await this.appointmentsRepository.findAndCount({
      relations: ['employee', 'service'],
      skip,
      take: pagination.limit,
      order: {
        [pagination.sortBy]: pagination.sortOrder,
      },
    });

    return {
      data: appointments,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    };
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const dateTime = new Date(createAppointmentDto.date_time);

    if (dateTime < new Date()) {
      throw new BadRequestException('Não é possível agendar no passado');
    }

    const existingAppointment = await this.appointmentsRepository.findOne({
      where: {
        service_id: createAppointmentDto.service_id,
        date_time: dateTime,
        status: AppointmentStatus.CONFIRMED,
      },
    });

    if (existingAppointment) {
      throw new ConflictException('Horário indisponível para este serviço');
    }

    const appointment = this.appointmentsRepository.create({
      service_id: createAppointmentDto.service_id,
      date_time: dateTime,
      client_name: createAppointmentDto.client_name,
      client_phone: createAppointmentDto.client_phone,
      notes: createAppointmentDto.notes,
      status: AppointmentStatus.PENDING,
    });

    return await this.appointmentsRepository.save(appointment);
  }
}
