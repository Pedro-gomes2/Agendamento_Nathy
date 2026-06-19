import { IsUUID, IsNotEmpty, IsString, IsDateString, IsOptional, MinLength, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  service_id: string;

  @IsDateString()
  @IsNotEmpty()
  date_time: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  client_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Telefone deve ser válido (E.164 format: +5583987654321 ou 83987654321)' })
  client_phone: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
