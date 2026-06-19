import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '@/modules/services/entity/service.entity';
import { PaginationDto, PaginatedResponse } from '@/common/dtos/pagination.dto';
import { MonitorPerformance } from '@/common/decorators/monitor-performance.decorator';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  @MonitorPerformance(1000)
  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<Service>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [services, total] = await this.servicesRepository.findAndCount({
      skip,
      take: pagination.limit,
      order: {
        [pagination.sortBy]: pagination.sortOrder,
      },
    });

    return {
      data: services,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    };
  }
}
