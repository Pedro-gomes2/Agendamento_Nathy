# 📚 Receita 01: Arquitetura de Módulos

## Objetivo
Entender como o projeto está organizado em módulos independentes e reutilizáveis.

## O que é um Módulo?

Um **módulo** no NestJS é um grupo lógico de funcionalidades relacionadas. Cada módulo em Salão Nathy é organizado assim:

```
auth/
├── entities/           # Models de banco de dados
│   └── user.entity.ts
├── dto/                # Data Transfer Objects (validação)
│   ├── login.dto.ts
│   └── register-employee.dto.ts
├── strategy/           # Estratégias (JWT, OAuth, etc)
│   └── jwt.strategy.ts
├── auth.module.ts      # Declaração do módulo
├── auth.service.ts     # Lógica de negócio
└── auth.controller.ts  # Rotas HTTP
```

## Módulos do Projeto

### 1. `auth/` - Autenticação e Autorização
**Responsabilidade:** Gerenciar login, JWT tokens, senha com Bcrypt

**Entidade Principal:**
- `User` - email, password (hashed), role (admin/employee), timestamps

**Endpoints Principais:**
```http
POST /api/v1/auth/login              # Login
POST /api/v1/auth/register-employee  # Registrar funcionária (admin only)
```

**Exemplo de Uso:**
```typescript
// No controlador, injetar AuthService
constructor(private authService: AuthService) {}

// No service, usar Bcrypt
const hashedPassword = await bcrypt.hash(password, 10);
```

---

### 2. `appointments/` - Agendamentos de Serviços
**Responsabilidade:** CRUD de agendamentos com prevenção de double-booking

**Entidade Principal:**
- `Appointment` - employee_id, service_id, client_phone, date_time, status (pending/confirmed/completed/cancelled)

**Endpoints Principais:**
```http
GET    /api/v1/appointments              # Listar (filtra por role)
POST   /api/v1/appointments              # Criar
PATCH  /api/v1/appointments/:id/status   # Alterar status
DELETE /api/v1/appointments/:id          # Cancelar
```

**Validações:**
- Impedir double-booking (mesma employee no mesmo horário)
- Funcionária vê apenas seus agendamentos
- Admin vê todos

---

### 3. `services/` - Serviços do Salão
**Responsabilidade:** CRUD de serviços (corte, escova, manicure, etc)

**Entidade Principal:**
- `Service` - name, description, price, duration_minutes, image_url

**Endpoints Principais:**
```http
GET    /api/v1/services      # Listar (com cache Redis)
POST   /api/v1/services      # Criar (admin only)
PATCH  /api/v1/services/:id  # Editar (admin only)
DELETE /api/v1/services/:id  # Deletar (admin only)
```

**Cache:**
- Lista de serviços cacheada por 5 minutos em Redis
- Invalidado ao criar/editar/deletar

---

### 4. `users/` - Gerenciamento de Funcionárias
**Responsabilidade:** CRUD de usuários/funcionárias (listar, ativar, desativar)

**Entidade Principal:**
- `User` (compartilhada com auth/) - reutiliza a mesma entity

**Endpoints Principais:**
```http
GET    /api/v1/users        # Listar funcionárias (admin only)
PATCH  /api/v1/users/:id    # Ativar/desativar (admin only)
DELETE /api/v1/users/:id    # Deletar funcionária (admin only)
```

---

### 5. `financial/` - Relatórios Financeiros
**Responsabilidade:** Cálculo de faturamento e comissões

**Entidade Principal:**
- `FinancialTransaction` - type (entry/exit), value, date, employee_id, commission

**Endpoints Principais:**
```http
GET /api/v1/financial/report  # Relatório de faturamento (admin)
GET /api/v1/financial/my-report  # Meu faturamento (funcionária)
```

**Cálculo de Comissão:**
```
commission = total_revenue * commission_rate / 100
```

---

### 6. `admin/` - Operações de Administrador
**Responsabilidade:** Funcionalidades exclusivas para admin

**Endpoints Principais:**
```http
PATCH /api/v1/admin/users/:id/commission  # Definir taxa de comissão
```

---

## Padrão de Módulo

Todo módulo segue este padrão:

### 1. Entity (Modelo de Banco)
```typescript
// auth/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string; // Sempre hashed com Bcrypt!
}
```

### 2. DTO (Validação)
```typescript
// auth/dto/login.dto.ts
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
```

### 3. Service (Lógica de Negócio)
```typescript
// auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
```

### 4. Controller (Rotas HTTP)
```typescript
// auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

### 5. Module (Declaração)
```typescript
// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], // Exporta para outros módulos usarem
})
export class AuthModule {}
```

---

## Como Adicionar um Novo Módulo?

Exemplo: criar módulo `reviews/` para avaliar serviços

```bash
# 1. Criar estrutura
mkdir -p src/modules/reviews/{entities,dto}

# 2. Criar entity
touch src/modules/reviews/entities/review.entity.ts

# 3. Criar DTOs
touch src/modules/reviews/dto/create-review.dto.ts

# 4. Criar service e controller
touch src/modules/reviews/reviews.service.ts
touch src/modules/reviews/reviews.controller.ts

# 5. Criar module
touch src/modules/reviews/reviews.module.ts
```

Implementar padrão e importar em `app.module.ts`:

```typescript
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [ReviewsModule, ...outrosModulos],
})
export class AppModule {}
```

---

## Dependências Entre Módulos

```
app.module
├── auth (base)
│   └── exports AuthService, JwtModule
├── users (depende de auth)
│   └── importa User entity
├── services (independente)
├── appointments (depende de auth, services)
│   └── importa User, Service entities
└── financial (depende de auth)
    └── importa User entity
```

Use `exports: []` no `@Module()` para compartilhar providers com outros módulos.

---

## Próximos Passos
- Ler [Receita 02: Entidades](./02_ENTIDADES.md)
- Ler [Receita 03: DTOs](./03_DTOS.md)
- Ler [Receita 05: Guards](./05_GUARDS.md)
