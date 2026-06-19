import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar profissionais disponíveis (público)',
    description: 'Endpoint público para clientes escolherem qual profissional atenderá. Retorna apenas informações públicas.',
  })
  async listPublic() {
    return await this.usersService.findAllPublic();
  }
}
