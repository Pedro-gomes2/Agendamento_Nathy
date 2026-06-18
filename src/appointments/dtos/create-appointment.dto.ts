import {
  IsString,
  IsDateString,
  IsUUID,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do cliente',
  })
  @IsString()
  @MinLength(3)
  client_name: string;

  @ApiProperty({
    example: '+5583999999999',
    description: 'Telefone do cliente (com WhatsApp)',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Telefone deve ser válido no formato E.164',
  })
  client_phone: string;

  @ApiProperty({
    example: '2025-06-20T14:30:00Z',
    description: 'Data e hora do agendamento (ISO 8601)',
  })
  @IsDateString()
  date_time: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da funcionária',
  })
  @IsUUID()
  employee_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID do serviço',
  })
  @IsUUID()
  service_id: string;

  @ApiProperty({
    example: 'Cliente solicitou horário específico',
    description: 'Notas adicionais',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
