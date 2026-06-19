import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        commission_rate: user.commission_rate,
        image_url: user.image_url,
      },
    };
  }

  async registerEmployee(
    registerEmployeeDto: RegisterEmployeeDto,
    adminId: string,
  ) {
    const admin = await this.usersRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new BadRequestException('Apenas admin pode registrar funcionárias');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: registerEmployeeDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado no sistema');
    }

    const hashedPassword = await bcrypt.hash(registerEmployeeDto.password, 10);

    const newEmployee = this.usersRepository.create({
      name: registerEmployeeDto.name,
      email: registerEmployeeDto.email,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
      specialty: registerEmployeeDto.specialty || null,
      commission_rate: registerEmployeeDto.commission_rate || 0,
      image_url: registerEmployeeDto.image_url || null,
      is_active: true,
    });

    await this.usersRepository.save(newEmployee);

    return {
      id: newEmployee.id,
      name: newEmployee.name,
      email: newEmployee.email,
      role: newEmployee.role,
      specialty: newEmployee.specialty,
      commission_rate: newEmployee.commission_rate,
      image_url: newEmployee.image_url,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
