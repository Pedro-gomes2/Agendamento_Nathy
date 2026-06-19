import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidImageUrl } from '../../../common/validators';

export class RegisterEmployeeDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo da funcionária',
  })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  name: string;

  @ApiProperty({
    example: 'maria@salao.com',
    description: 'Email único da funcionária',
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha inicial (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    example: 'Manicure',
    description: 'Especialidade da funcionária',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({
    example: 25.5,
    description: 'Percentual de comissão (0-100)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL da foto da funcionária',
    required: false,
  })
  @IsOptional()
  @Validate(IsValidImageUrl)
  image_url?: string;
}
