import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '@/entities/appointment.entity';
import { PaginationDto, PaginatedResponse } from '@/common/dtos/pagination.dto';
import { MonitorPerformance } from '@/common/decorators/monitor-performance.decorator';

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
}
