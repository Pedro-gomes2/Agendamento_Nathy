import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

/**
 * TEMPORARY SEED ENDPOINT - Remove in production
 * Used to populate initial data after first deployment
 */
@ApiTags('Auth - Seed (Temporary)')
@Controller('auth')
export class AuthSeedController {
  constructor(private authService: AuthService) {}

  @Post('seed')
  @ApiOperation({
    summary: 'SEED DATA - Create initial users (TEMPORARY)',
    description: 'Creates admin@salao.com and employee users. Remove after first run.',
  })
  async seed() {
    return await this.authService.seedInitialUsers();
  }
}
