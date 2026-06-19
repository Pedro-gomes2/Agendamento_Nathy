import { IsEmail, IsString, MinLength, IsDecimal, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'maria.silva@salao.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Manicure e Pedicure', required: false })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({ example: '25.00', required: false })
  @IsOptional()
  @IsDecimal()
  commission_percentage?: number;

  @ApiProperty({ example: 'https://...', required: false })
  @IsOptional()
  @IsString()
  photo_url?: string;
}
