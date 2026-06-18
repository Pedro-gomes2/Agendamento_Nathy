import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinancialTransaction,
  TransactionType,
} from '../entities/financial-transaction.entity';
import { User } from '../entities/user.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';

export interface FinancialReport {
  total_entries: number;
  total_exits: number;
  balance: number;
  start_date?: Date;
  end_date?: Date;
  transactions: FinancialTransaction[];
}

export interface EmployeeCommission {
  employee_id: string;
  employee_name: string;
  totalRevenue: number;
  commissionPercentage: number;
  commission_value: number;
}

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private financialRepository: Repository<FinancialTransaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<FinancialTransaction> {
    if (createTransactionDto.employee_id) {
      const employee = await this.usersRepository.findOne({
        where: { id: createTransactionDto.employee_id },
      });

      if (!employee) {
        throw new NotFoundException('Funcionária não encontrada');
      }
    }

    const transaction = new FinancialTransaction();
    transaction.type = createTransactionDto.type;
    transaction.value = createTransactionDto.value;
    transaction.description = createTransactionDto.description;
    transaction.employee_id = createTransactionDto.employee_id || undefined;
    transaction.date = new Date();

    return this.financialRepository.save(transaction);
  }

  async findOne(id: string): Promise<FinancialTransaction> {
    const transaction = await this.financialRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async findAll(): Promise<FinancialTransaction[]> {
    return this.financialRepository.find({
      relations: ['employee'],
      order: { date: 'DESC' },
    });
  }

  async getReport(startDate?: Date, endDate?: Date): Promise<FinancialReport> {
    const queryBuilder = this.financialRepository.createQueryBuilder(
      'transaction',
    );

    if (startDate && endDate) {
      queryBuilder.where('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const transactions = await queryBuilder
      .leftJoinAndSelect('transaction.employee', 'employee')
      .orderBy('transaction.date', 'DESC')
      .getMany();

    const totalEntries = transactions
      .filter((t) => t.type === TransactionType.ENTRY)
      .reduce((sum, t) => sum + Number(t.value), 0);

    const totalExits = transactions
      .filter((t) => t.type === TransactionType.EXIT)
      .reduce((sum, t) => sum + Number(t.value), 0);

    const balance = totalEntries - totalExits;

    return {
      total_entries: totalEntries,
      total_exits: totalExits,
      balance,
      start_date: startDate,
      end_date: endDate,
      transactions,
    };
  }

  async getEmployeeCommissions(): Promise<EmployeeCommission[]> {
    const result = await this.financialRepository
      .createQueryBuilder('t')
      .select('u.id', 'employee_id')
      .addSelect('u.name', 'employee_name')
      .addSelect('u.commission_rate', 'commission_rate')
      .addSelect('COALESCE(SUM(t.value), 0)', 'total_revenue')
      .innerJoin(
        User,
        'u',
        'u.id = t.employee_id',
      )
      .where('t.type = :type', { type: TransactionType.ENTRY })
      .andWhere('u.commission_rate > 0')
      .groupBy('u.id')
      .addGroupBy('u.name')
      .addGroupBy('u.commission_rate')
      .getRawMany();

    // Sort in memory after fetching to avoid database compatibility issues
    const commissions = result.map(r => ({
      employee_id: r.employee_id,
      employee_name: r.employee_name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      commissionPercentage: Number(r.commission_rate),
      commission_value: (parseFloat(r.total_revenue) || 0) * (Number(r.commission_rate) / 100),
    }));

    return commissions.sort((a, b) => b.commission_value - a.commission_value);
  }

  async getEmployeeFinancials(
    employeeId: string,
  ): Promise<FinancialTransaction[]> {
    const employee = await this.usersRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Funcionária não encontrada');
    }

    const transactions = await this.financialRepository.find({
      where: { employee_id: employeeId },
      order: { date: 'DESC' },
    });

    return transactions;
  }

  async delete(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    await this.financialRepository.remove(transaction);
  }
}
