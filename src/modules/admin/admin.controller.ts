// Caminho: C:\Users\JP\Desktop\salao_nathy_backend\src\modules\admin\admin.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/entities/user.entity';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { CreateServiceDto } from './dtos/create-service.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ========== EMPLOYEES ==========

  @Post('employees')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Criar nova funcionária',
    description:
      'Endpoint protegido apenas para Admin. Cria novo login para uma funcionária com email, senha e role "employee"',
  })
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.adminService.createEmployee(createEmployeeDto);
  }

  @Get('employees')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas as funcionárias' })
  async listEmployees() {
    return this.adminService.listEmployees();
  }

  @Put('employees/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar dados de uma funcionária' })
  async updateEmployee(
    @Param('id') employeeId: string,
    @Body() updateData: Partial<CreateEmployeeDto>,
  ) {
    return this.adminService.updateEmployee(employeeId, updateData);
  }

  @Delete('employees/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar uma funcionária' })
  async deleteEmployee(@Param('id') employeeId: string) {
    return this.adminService.deleteEmployee(employeeId);
  }

  // ========== SERVICES ==========

  @Post('services')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Criar novo serviço',
    description: 'Cria um novo serviço com nome, preço, duração e imagem',
  })
  async createService(@Body() createServiceDto: CreateServiceDto) {
    return this.adminService.createService(createServiceDto);
  }

  @Get('services')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os serviços' })
  async listServices() {
    return this.adminService.listServices();
  }

  @Put('services/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar um serviço' })
  async updateService(
    @Param('id') serviceId: string,
    @Body() updateData: Partial<CreateServiceDto>,
  ) {
    return this.adminService.updateService(serviceId, updateData);
  }

  @Delete('services/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar um serviço' })
  async deleteService(@Param('id') serviceId: string) {
    return this.adminService.deleteService(serviceId);
  }
}
