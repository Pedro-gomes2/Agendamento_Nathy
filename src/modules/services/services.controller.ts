import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { PaginationDto } from '@/common/dtos/pagination.dto';

@ApiTags('Services')
@Controller('services')
@ApiBearerAuth('access-token')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar serviços do salão com paginação' })
  async findAll(@Query() pagination: PaginationDto) {
    return await this.servicesService.findAllPaginated(pagination);
  }
}
