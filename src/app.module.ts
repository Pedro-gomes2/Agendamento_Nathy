import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { ServicesModule } from '@/modules/services/services.module';
import { AppointmentsModule } from '@/modules/appointments/appointments.module';
import { FinancialModule } from '@/modules/financial/financial.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { databaseConfig } from '@/config/database.config';
import { cacheConfig } from '@/common/config/cache.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register(cacheConfig),
    TypeOrmModule.forRoot(databaseConfig()),
    AuthModule,
    AdminModule,
    UsersModule,
    ServicesModule,
    AppointmentsModule,
    FinancialModule,
  ],
})
export class AppModule {}
