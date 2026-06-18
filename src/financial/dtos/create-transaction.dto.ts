import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../entities/financial-transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.ENTRY,
    description: 'Tipo de transação (entrada ou saída)',
  })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    example: 150.5,
    description: 'Valor da transação',
  })
  @IsNumber()
  @Min(0.01)
  value!: number;

  @ApiProperty({
    example: 'Pagamento de serviço',
    description: 'Descrição da transação',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do funcionário (opcional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  employee_id?: string;
}
