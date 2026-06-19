import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/entities/user.entity';

@ApiTags('Financial')
@Controller('financial')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('access-token')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get()
  @ApiOperation({ summary: 'Listar transações financeiras com paginação' })
  async findAll(@Query() pagination: PaginationDto) {
    return await this.financialService.findAllPaginated(pagination);
  }

  @Get('report')
  @ApiOperation({ summary: 'Relatório financeiro resumido (receita total, comissão, etc)' })
  async getReport() {
    return await this.financialService.getReport();
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Comissões por funcionária ordenadas por valor' })
  async getCommissions() {
    return await this.financialService.getCommissions();
  }
}
