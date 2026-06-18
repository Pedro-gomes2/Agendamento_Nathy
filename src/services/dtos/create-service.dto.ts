import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Corte + Hidratação',
    description: 'Nome do serviço',
  })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  name!: string;

  @ApiProperty({
    example: 'Corte profissional com hidratação profunda',
    description: 'Descrição do serviço',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 150.5,
    description: 'Preço do serviço',
  })
  @IsNumber()
  @Min(0.01, { message: 'Preço deve ser maior que 0' })
  price!: number;

  @ApiProperty({
    example: 60,
    description: 'Duração do serviço em minutos',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(15, { message: 'Duração mínima é 15 minutos' })
  duration?: number;

  @ApiProperty({
    example: 'https://example.com/services/corte.jpg',
    description: 'URL da imagem do serviço',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}
