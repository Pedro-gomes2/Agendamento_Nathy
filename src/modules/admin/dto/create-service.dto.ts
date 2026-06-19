import { IsString, IsNumber, IsInt, IsOptional, Validate, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidImageUrl } from '../../../common/validators';

export class CreateServiceDto {
  @ApiProperty({ example: 'Corte + Hidratação' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Corte profissional com hidratação profunda', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: 90, required: false })
  @IsOptional()
  @IsInt()
  duration_minutes?: number;

  @ApiProperty({ example: 'https://...', required: false })
  @IsOptional()
  @Validate(IsValidImageUrl)
  image_url?: string;
}
