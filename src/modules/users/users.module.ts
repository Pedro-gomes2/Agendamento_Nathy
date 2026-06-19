import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmployeesController } from './employees.controller';
import { User } from '@/modules/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, EmployeesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
