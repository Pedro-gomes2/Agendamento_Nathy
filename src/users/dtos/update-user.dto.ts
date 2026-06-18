import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Maria Silva Updated',
    description: 'Nome da funcionária',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Manicure Profissional',
    description: 'Especialidade',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({
    example: 30,
    description: 'Percentual de comissão',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number;

  @ApiProperty({
    example: 'https://example.com/new-photo.jpg',
    description: 'URL da foto',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}
