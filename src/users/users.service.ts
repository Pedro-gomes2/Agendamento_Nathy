import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['appointments'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { is_active: true },
      select: [
        'id',
        'name',
        'email',
        'role',
        'specialty',
        'commission_rate',
        'image_url',
        'created_at',
      ],
    });
  }

  async findAllEmployees(): Promise<User[]> {
    return this.usersRepository.find({
      where: { is_active: true },
      select: [
        'id',
        'name',
        'email',
        'specialty',
        'commission_rate',
        'image_url',
        'created_at',
      ],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.specialty) user.specialty = updateUserDto.specialty;
    if (updateUserDto.commission_rate !== undefined)
      user.commission_rate = updateUserDto.commission_rate;
    if (updateUserDto.image_url !== undefined)
      user.image_url = updateUserDto.image_url;

    return this.usersRepository.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = false;
    return this.usersRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = true;
    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
