import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinancialService } from '../services/financial.service';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/entities/user.entity';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() pagination: PaginationDto) {
    return await this.financialService.findAllPaginated(pagination);
  }
}
