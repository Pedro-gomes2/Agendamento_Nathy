import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';

@ApiTags('Financial')
@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Post('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Criar transação financeira',
    description: 'Apenas admin pode criar transações',
  })
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.financialService.createTransaction(createTransactionDto);
  }

  @Get('transactions/list/paginated')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Itens por página (padrão: 20, máx: 100)',
  })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    required: false,
    description: 'Campo para ordenação (padrão: created_at)',
  })
  @ApiQuery({
    name: 'sortOrder',
    type: String,
    enum: ['ASC', 'DESC'],
    required: false,
    description: 'Direção da ordenação (padrão: DESC)',
  })
  @ApiOperation({
    summary: 'Listar transações com paginação',
    description: 'Apenas admin - retorna transações com paginação',
  })
  async findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const pagination = new PaginationDto();
    if (page) pagination.page = Math.max(1, parseInt(page, 10) || 1);
    if (limit) pagination.limit = Math.min(100, Math.max(5, parseInt(limit, 10) || 20));
    if (sortBy) pagination.sortBy = sortBy;
    if (sortOrder) pagination.sortOrder = (sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    return this.financialService.findAllPaginated(pagination);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar todas as transações',
    description: 'Apenas admin',
  })
  async findAll() {
    return this.financialService.findAll();
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @ApiOperation({
    summary: 'Obter dados de uma transação',
  })
  async findOne(@Param('id') id: string) {
    return this.financialService.findOne(id);
  }

  @Get('report/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2025-06-30T23:59:59Z',
  })
  @ApiOperation({
    summary: 'Obter relatório financeiro completo',
    description: 'Apenas admin - retorna totais de entradas, saídas e saldo',
  })
  async getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financialService.getReport(start, end);
  }

  @Get('commissions/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar comissões de todas as funcionárias',
    description:
      'Apenas admin - calcula comissões baseado em receita e percentual',
  })
  async getCommissions() {
    return this.financialService.getEmployeeCommissions();
  }

  @Get('my-financials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obter financeiros da funcionária logada',
  })
  async getMyFinancials(@CurrentUser() user: User) {
    return this.financialService.getEmployeeFinancials(user.id);
  }

  @Delete('transactions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @ApiOperation({
    summary: 'Deletar uma transação',
    description: 'Apenas admin',
  })
  async delete(@Param('id') id: string) {
    await this.financialService.delete(id);
    return { message: 'Transação deletada com sucesso' };
  }
}
