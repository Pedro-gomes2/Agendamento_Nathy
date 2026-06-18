# Salão Nathy Backend - Complete Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready NestJS backend with PostgreSQL, JWT auth, RBAC, and complete salon management modules.

**Architecture:** Modular NestJS app with TypeORM entities, role-based guards, Multer file uploads, and Swagger documentation. Dependency order: Config → Entities → DTOs → Auth → Users → Services → Appointments → Financial.

**Tech Stack:** NestJS 10+, TypeORM 0.3+, PostgreSQL, JWT, Bcrypt, Multer, Swagger/OpenAPI.

---

## File Structure Map

```
C:\Users\JP\Desktop\salao_nathy_backend\
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   └── database.config.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── transform.interceptor.ts
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── service.entity.ts
│   │   ├── appointment.entity.ts
│   │   └── financial-transaction.entity.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dtos/
│   │       ├── login.dto.ts
│   │       └── register-employee.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── dtos/
│   │       └── update-user.dto.ts
│   ├── services/
│   │   ├── services.module.ts
│   │   ├── services.service.ts
│   │   ├── services.controller.ts
│   │   └── dtos/
│   │       ├── create-service.dto.ts
│   │       └── update-service.dto.ts
│   ├── appointments/
│   │   ├── appointments.module.ts
│   │   ├── appointments.service.ts
│   │   ├── appointments.controller.ts
│   │   └── dtos/
│   │       ├── create-appointment.dto.ts
│   │       └── update-appointment.dto.ts
│   └── financial/
│       ├── financial.module.ts
│       ├── financial.service.ts
│       ├── financial.controller.ts
│       └── dtos/
│           └── create-transaction.dto.ts
├── uploads/
│   ├── services/
│   └── users/
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## Task 1: Setup Configuration Files & Main Entry

**Files:**
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\.env.example`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\tsconfig.json`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\package.json`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\main.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\config\database.config.ts`

### Step 1: Create .env.example

```bash
# Create the file
cat > C:\Users\JP\Desktop\salao_nathy_backend\.env.example << 'EOF'
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=salao_nathy
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=false

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=7d

NODE_ENV=development
PORT=3001
EOF
```

- [ ] Create `.env.example` with database and JWT config
- [ ] Verify file exists with `ls -la C:\Users\JP\Desktop\salao_nathy_backend\.env.example`

### Step 2: Create tsconfig.json

```bash
cat > C:\Users\JP\Desktop\salao_nathy_backend\tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "test"]
}
EOF
```

- [ ] Create `tsconfig.json` with strict mode
- [ ] Verify with `cat C:\Users\JP\Desktop\salao_nathy_backend\tsconfig.json | head -5`

### Step 3: Create package.json

```bash
cat > C:\Users\JP\Desktop\salao_nathy_backend\package.json << 'EOF'
{
  "name": "salao-nathy-backend",
  "version": "1.0.0",
  "description": "Backend API for Salão Nathy",
  "author": "Joao Oliveira",
  "license": "MIT",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/jwt": "^12.0.1",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/swagger": "^7.1.17",
    "@nestjs/typeorm": "^10.0.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "dotenv": "^16.3.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.11.3",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.0",
    "typeorm": "^0.3.19"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.0.3",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "eslint": "^8.56.0",
    "typescript": "^5.3.3"
  }
}
EOF
```

- [ ] Create `package.json`

### Step 4: Create database.config.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src\config"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\config\database.config.ts" << 'EOF'
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'salao_nathy',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
});
EOF
```

- [ ] Create database config

### Step 5: Create main.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\main.ts" << 'EOF'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Salão Nathy API')
    .setDescription('API REST para gerenciamento de salão de beleza')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addTag('Auth', 'Autenticação e login')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Services', 'Serviços do salão')
    .addTag('Appointments', 'Agendamentos')
    .addTag('Financial', 'Financeiro e fluxo de caixa')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅ API rodando em http://localhost:${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
EOF
```

- [ ] Create `main.ts`
- [ ] Commit: `git add .env.example tsconfig.json package.json src/main.ts src/config/database.config.ts && git commit -m "config: initial nestjs setup with swagger and database"`

---

## Task 2: Create All Entities

**Files:**
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\entities\user.entity.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\entities\service.entity.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\entities\appointment.entity.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\entities\financial-transaction.entity.ts`

### Step 1: Create user.entity.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src\entities"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\entities\user.entity.ts" << 'EOF'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { FinancialTransaction } from './financial-transaction.entity';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialty: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  commission_rate: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.employee)
  appointments: Appointment[];

  @OneToMany(
    () => FinancialTransaction,
    (transaction) => transaction.employee,
  )
  financial_transactions: FinancialTransaction[];
}
EOF
```

- [ ] Create `user.entity.ts`

### Step 2: Create service.entity.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\entities\service.entity.ts" << 'EOF'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 60 })
  duration: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}
EOF
```

- [ ] Create `service.entity.ts`

### Step 3: Create appointment.entity.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\entities\appointment.entity.ts" << 'EOF'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  client_name: string;

  @Column({ type: 'varchar', length: 20 })
  client_phone: string;

  @Column({ type: 'timestamp' })
  date_time: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'uuid', nullable: true })
  employee_id: string;

  @ManyToOne(() => Service, (service) => service.appointments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'uuid', nullable: true })
  service_id: string;
}
EOF
```

- [ ] Create `appointment.entity.ts`

### Step 4: Create financial-transaction.entity.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\entities\financial-transaction.entity.ts" << 'EOF'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

@Entity('financial_transactions')
export class FinancialTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.financial_transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'uuid', nullable: true })
  employee_id: string;
}
EOF
```

- [ ] Create `financial-transaction.entity.ts`
- [ ] Commit: `git add src/entities && git commit -m "feat: create all database entities with relationships"`

---

## Task 3: Create Common Decorators, Guards & Filters

**Files:**
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\common\decorators\roles.decorator.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\common\decorators\current-user.decorator.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\common\guards\roles.guard.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\common\filters\http-exception.filter.ts`

### Step 1: Create roles.decorator.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src\common\decorators"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\common\decorators\roles.decorator.ts" << 'EOF'
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
EOF
```

- [ ] Create `roles.decorator.ts`

### Step 2: Create current-user.decorator.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\common\decorators\current-user.decorator.ts" << 'EOF'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
EOF
```

- [ ] Create `current-user.decorator.ts`

### Step 3: Create roles.guard.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src\common\guards"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\common\guards\roles.guard.ts" << 'EOF'
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      );
    }

    return true;
  }
}
EOF
```

- [ ] Create `roles.guard.ts`

### Step 4: Create http-exception.filter.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src\common\filters"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\common\filters\http-exception.filter.ts" << 'EOF'
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === 'object'
        ? exceptionResponse
        : {
            statusCode: status,
            message: exceptionResponse,
          };

    response.status(status).json({
      ...error,
      timestamp: new Date().toISOString(),
    });
  }
}
EOF
```

- [ ] Create `http-exception.filter.ts`
- [ ] Commit: `git add src/common && git commit -m "feat: add common decorators, guards and exception filters"`

---

## Task 4: Create Auth Module (DTOs, Service, Controller, Strategy)

**Files:**
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\auth\dtos\login.dto.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\auth\dtos\register-employee.dto.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\auth\strategies\jwt.strategy.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\auth\auth.service.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\auth\auth.controller.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\auth\auth.module.ts`

### Step 1: Create login.dto.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src\auth\dtos"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\auth\dtos\login.dto.ts" << 'EOF'
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@salao.com',
    description: 'Email do usuário',
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}
EOF
```

- [ ] Create `login.dto.ts`

### Step 2: Create register-employee.dto.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\auth\dtos\register-employee.dto.ts" << 'EOF'
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmployeeDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo da funcionária',
  })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  name: string;

  @ApiProperty({
    example: 'maria@salao.com',
    description: 'Email único da funcionária',
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha inicial (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    example: 'Manicure',
    description: 'Especialidade da funcionária',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({
    example: 25.5,
    description: 'Percentual de comissão (0-100)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL da foto da funcionária',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}
EOF
```

- [ ] Create `register-employee.dto.ts`

### Step 3: Create jwt.strategy.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src\auth\strategies"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\auth\strategies\jwt.strategy.ts" << 'EOF'
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_secret_key',
    });
  }

  async validate(payload: any) {
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });
    return user;
  }
}
EOF
```

- [ ] Create `jwt.strategy.ts`

### Step 4: Create auth.service.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\auth\auth.service.ts" << 'EOF'
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
import { User, UserRole } from '../entities/user.entity';
import { LoginDto } from './dtos/login.dto';
import { RegisterEmployeeDto } from './dtos/register-employee.dto';

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
}
EOF
```

- [ ] Create `auth.service.ts`

### Step 5: Create auth.controller.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\auth\auth.controller.ts" << 'EOF'
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterEmployeeDto } from './dtos/register-employee.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../entities/user.entity';

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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @UseGuards(AuthGuard('jwt'))
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
EOF
```

- [ ] Create `auth.controller.ts`

### Step 6: Create auth.module.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\auth\auth.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_secret_key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
EOF
```

- [ ] Create `auth.module.ts`
- [ ] Commit: `git add src/auth && git commit -m "feat: complete auth module with jwt and rbac"`

---

## Task 5: Create Users Module

**Files:**
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\users\dtos\update-user.dto.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\users\users.service.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\users\users.controller.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\users\users.module.ts`

### Step 1: Create update-user.dto.ts

```bash
mkdir -p "C:\Users\JP\Desktop\salao_nathy_backend\src\users\dtos"
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\users\dtos\update-user.dto.ts" << 'EOF'
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Maria Silva Updated',
    description: 'Nome da funcionária',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Manicure Profissional',
    description: 'Especialidade',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({
    example: 30,
    description: 'Percentual de comissão',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number;

  @ApiProperty({
    example: 'https://example.com/new-photo.jpg',
    description: 'URL da foto',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}
EOF
```

- [ ] Create `update-user.dto.ts`

### Step 2: Create users.service.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\users\users.service.ts" << 'EOF'
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
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
      where: { role: UserRole.EMPLOYEE, is_active: true },
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

  async deactivate(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.is_active = false;
    await this.usersRepository.save(user);
  }

  async activate(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.is_active = true;
    await this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
EOF
```

- [ ] Create `users.service.ts`

### Step 3: Create users.controller.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\users\users.controller.ts" << 'EOF'
import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { User, UserRole } from '../entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Apenas admin pode listar usuários',
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('employees')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar todas as funcionárias',
    description: 'Retorna lista de funcionárias ativas',
  })
  async findAllEmployees() {
    return this.usersService.findAllEmployees();
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obter perfil do usuário logado',
  })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Obter dados de um usuário',
  })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Atualizar dados de um usuário',
    description: 'Apenas admin pode atualizar usuários',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Desativar um usuário',
  })
  async deactivate(@Param('id') id: string) {
    await this.usersService.deactivate(id);
    return { message: 'Usuário desativado com sucesso' };
  }

  @Patch(':id/activate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Ativar um usuário',
  })
  async activate(@Param('id') id: string) {
    await this.usersService.activate(id);
    return { message: 'Usuário ativado com sucesso' };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Deletar um usuário',
    description: 'Apenas admin pode deletar usuários',
  })
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'Usuário deletado com sucesso' };
  }
}
EOF
```

- [ ] Create `users.controller.ts`

### Step 4: Create users.module.ts

```bash
cat > "C:\Users\JP\Desktop\salao_nathy_backend\src\users\users.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
EOF
```

- [ ] Create `users.module.ts`
- [ ] Commit: `git add src/users && git commit -m "feat: complete users module with crud"`

---

## Task 6: Create Services Module (Com Multer para Upload)

**Files:**
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\services\dtos\create-service.dto.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\services\dtos\update-service.dto.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\services\services.service.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\services\services.controller.ts`
- Create: `C:\Users\JP\Desktop\salao_nathy_backend\src\services\services.module.ts`

Continuando no próximo bloco devido à extensão...
