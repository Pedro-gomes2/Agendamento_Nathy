import { Controller, Get, Query } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { PaginationDto } from '@/common/dtos/pagination.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    return await this.servicesService.findAllPaginated(pagination);
  }
}
