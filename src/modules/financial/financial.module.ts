import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './services/financial.service';
import { FinancialController } from './controllers/financial.controller';
import { FinancialTransaction } from '@/modules/financial/entities/financial-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialTransaction])],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
