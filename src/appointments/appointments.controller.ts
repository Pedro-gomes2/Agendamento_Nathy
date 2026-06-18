import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentDto } from './dtos/update-appointment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../entities/user.entity';
import { AppointmentStatus } from '../entities/appointment.entity';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo agendamento',
    description: 'Rota pública - Cliente pode criar agendamento',
  })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiQuery({
    name: 'status',
    enum: AppointmentStatus,
    required: false,
    description: 'Filtrar por status',
  })
  @ApiOperation({
    summary: 'Listar todos os agendamentos',
    description: 'Apenas admin - retorna todos os agendamentos',
  })
  async findAll(@Query('status') status?: AppointmentStatus) {
    if (status) {
      return this.appointmentsService.findByStatus(status);
    }
    return this.appointmentsService.findAll();
  }

  @Get('my-appointments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar agendamentos da funcionária logada',
  })
  async getMyAppointments(@CurrentUser() user: User) {
    return this.appointmentsService.findByEmployee(user.id);
  }

  @Get('employee/:employeeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'employeeId', description: 'ID da funcionária' })
  @ApiOperation({
    summary: 'Listar agendamentos de uma funcionária (apenas admin)',
  })
  async getEmployeeAppointments(@Param('employeeId') employeeId: string) {
    return this.appointmentsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiOperation({
    summary: 'Obter dados de um agendamento',
  })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiOperation({
    summary: 'Atualizar agendamento',
    description: 'Apenas admin',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiOperation({
    summary: 'Confirmar agendamento',
  })
  async confirm(@Param('id') id: string) {
    return this.appointmentsService.update(id, { status: AppointmentStatus.CONFIRMED });
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiOperation({
    summary: 'Marcar agendamento como concluído',
  })
  async complete(@Param('id') id: string) {
    return this.appointmentsService.complete(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiOperation({
    summary: 'Cancelar agendamento',
  })
  async cancel(@Param('id') id: string) {
    await this.appointmentsService.cancel(id);
    return { message: 'Agendamento cancelado' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiOperation({
    summary: 'Deletar agendamento permanentemente',
    description: 'Apenas admin',
  })
  async delete(@Param('id') id: string) {
    await this.appointmentsService.delete(id);
    return { message: 'Agendamento deletado' };
  }
}
