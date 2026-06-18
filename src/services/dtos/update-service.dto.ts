import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiProperty({
    example: 'Corte + Hidratação Premium',
    description: 'Nome do serviço',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty({
    example: 'Corte profissional com hidratação premium',
    description: 'Descrição do serviço',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 180.75,
    description: 'Preço do serviço',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @ApiProperty({
    example: 90,
    description: 'Duração em minutos',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number;
}
