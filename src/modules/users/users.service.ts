import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/auth/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string) {
    return await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
    });
  }

  async update(id: string, data: Partial<User>) {
    await this.usersRepository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string) {
    await this.usersRepository.delete(id);
    return { message: 'Usuário deletado com sucesso' };
  }
}
