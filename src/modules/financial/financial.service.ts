import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialTransaction } from '@/modules/financial/entity/financial-transaction.entity';
import { PaginationDto, PaginatedResponse } from '@/common/dtos/pagination.dto';
import { MonitorPerformance } from '@/common/decorators/monitor-performance.decorator';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private financialRepository: Repository<FinancialTransaction>,
  ) {}

  @MonitorPerformance(1000)
  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<FinancialTransaction>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [transactions, total] = await this.financialRepository.findAndCount({
      relations: ['employee'],
      skip,
      take: pagination.limit,
      order: {
        [pagination.sortBy]: pagination.sortOrder,
      },
    });

    return {
      data: transactions,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    };
  }
}
