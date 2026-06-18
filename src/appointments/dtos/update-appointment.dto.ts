import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../../entities/appointment.entity';

export class UpdateAppointmentDto {
  @ApiProperty({
    example: '2025-06-20T15:00:00Z',
    description: 'Nova data e hora',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_time?: string;

  @ApiProperty({
    enum: AppointmentStatus,
    example: 'confirmed',
    description: 'Status do agendamento',
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    example: 'Cliente confirmou',
    description: 'Notas adicionais',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
