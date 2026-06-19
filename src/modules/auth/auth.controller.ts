import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { User, UserRole } from './entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Realiza login com email e senha, retorna JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou senha inválidos',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register-employee')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Registrar nova funcionária',
    description:
      'Apenas admin pode registrar nova funcionária no sistema. Cria email e senha inicial.',
  })
  @ApiResponse({
    status: 201,
    description: 'Funcionária registrada com sucesso',
  })
  @ApiResponse({
    status: 403,
    description: 'Permissão negada - apenas admin',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
  })
  async registerEmployee(
    @Body() registerEmployeeDto: RegisterEmployeeDto,
    @CurrentUser() user: User,
  ) {
    return this.authService.registerEmployee(registerEmployeeDto, user.id);
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obter perfil do usuário logado',
  })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: user.specialty,
      commission_rate: user.commission_rate,
      image_url: user.image_url,
    };
  }
}
