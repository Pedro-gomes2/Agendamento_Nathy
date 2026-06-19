import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialTransaction, TransactionType } from '@/modules/financial/entities/financial-transaction.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { PaginationDto, PaginatedResponse } from '@/common/dtos/pagination.dto';
import { MonitorPerformance } from '@/common/decorators/monitor-performance.decorator';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private financialRepository: Repository<FinancialTransaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  async getReport() {
    const entries = await this.financialRepository.find({
      where: { type: TransactionType.ENTRY },
    });

    const exits = await this.financialRepository.find({
      where: { type: TransactionType.EXIT },
    });

    const totalRevenue = entries.reduce((sum, t) => sum + Number(t.value), 0);
    const totalExit = exits.reduce((sum, t) => sum + Number(t.value), 0);

    const activeEmployees = await this.usersRepository.count({
      where: { is_active: true },
    });

    return {
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      total_exit: parseFloat(totalExit.toFixed(2)),
      net_revenue: parseFloat((totalRevenue - totalExit).toFixed(2)),
      active_employees: activeEmployees,
      transaction_count: entries.length + exits.length,
    };
  }

  async getCommissions() {
    const employees = await this.usersRepository.find({
      where: { is_active: true },
      relations: ['appointments'],
    });

    const commissionsData = await Promise.all(
      employees.map(async (employee) => {
        const appointments = await this.financialRepository.find({
          where: {
            employee_id: employee.id,
            type: TransactionType.ENTRY,
          },
        });

        const totalRevenue = appointments.reduce((sum, t) => sum + Number(t.value), 0);
        const commission = (totalRevenue * employee.commission_rate) / 100;

        return {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          specialty: employee.specialty,
          commission_rate: employee.commission_rate,
          total_revenue: parseFloat(totalRevenue.toFixed(2)),
          commission: parseFloat(commission.toFixed(2)),
        };
      }),
    );

    return commissionsData.sort((a, b) => b.commission - a.commission);
  }
}
