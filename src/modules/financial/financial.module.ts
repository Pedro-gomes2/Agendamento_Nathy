import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { FinancialTransaction } from '@/modules/financial/entities/financial-transaction.entity';
import { User } from '@/modules/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialTransaction, User])],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
