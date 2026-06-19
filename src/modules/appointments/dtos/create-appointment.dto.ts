import { IsUUID, IsNotEmpty, IsString, IsPhoneNumber, IsDateString, IsOptional, MinLength } from 'class-validator';

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

  @IsPhoneNumber('BR')
  @IsNotEmpty()
  client_phone: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
