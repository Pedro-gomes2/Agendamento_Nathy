# 📚 Receita 04: Decoradores Customizados

## Objetivo
Entender como criar e usar decoradores para reutilizar lógica em controllers e métodos.

## O que é um Decorador?

Um **decorador** é uma função que adiciona funcionalidade a uma classe, método ou parâmetro. Exemplo:

```typescript
// Sem decorador (repetitivo)
@Post('login')
login(@Body() body) {
  const user = this.req.user; // Precisa acessar manualmente
}

// Com decorador (limpo)
@Post('login')
login(@CurrentUser() user: User) {
  // User já está injetado!
}
```

---

## Decoradores do Salão Nathy

### 1️⃣ @CurrentUser (common/decorators/current-user.decorator.ts)

**O que faz:** Injeta o usuário autenticado no método

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/modules/auth/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
```

**Como usar:**

```typescript
@Controller('appointments')
export class AppointmentsController {
  @Get('my-appointments')
  @UseGuards(JwtAuthGuard) // Precisa estar autenticado!
  async getMyAppointments(@CurrentUser() user: User) {
    // user já é do tipo User, com id, email, role, etc
    return this.appointmentsService.findByEmployee(user.id);
  }
}
```

**Antes vs Depois:**

```typescript
// ❌ Sem @CurrentUser
@Get('my-appointments')
async getMyAppointments(@Req() req: any) {
  const userId = req.user.id; // Precisa acessar req.user
  const user = req.user as User; // Type casting manual
}

// ✅ Com @CurrentUser
@Get('my-appointments')
async getMyAppointments(@CurrentUser() user: User) {
  const userId = user.id; // Direto!
}
```

---

### 2️⃣ @Roles (common/decorators/roles.decorator.ts)

**O que faz:** Define quais roles podem acessar um endpoint

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/modules/auth/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
```

**Como usar:**

```typescript
@Controller('admin')
export class AdminController {
  @Post('create-employee')
  @Roles('admin') // Só admin
  async createEmployee(@Body() dto: RegisterEmployeeDto) {
    return this.adminService.createEmployee(dto);
  }

  @Delete(':id')
  @Roles('admin') // Só admin
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Get('my-data')
  @Roles('admin', 'employee') // Admin OU employee
  async getMyData(@CurrentUser() user: User) {
    return user;
  }
}
```

**Sem Guard não faz nada!** Precisa usar `RolesGuard` também (veja Receita 05).

---

## Como Criar um Novo Decorador?

Exemplo: criar `@IsAdmin()` para admin-only

```typescript
// common/decorators/is-admin.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_ADMIN_KEY = 'isAdmin';
export const IsAdmin = () => SetMetadata(IS_ADMIN_KEY, true);
```

Usar no controller:
```typescript
@Post('dangerous-action')
@IsAdmin()
@UseGuards(JwtAuthGuard, AdminGuard) // Guardsneeded!
async dangerousAction() {
  return { message: 'Only admin can do this' };
}
```

---

## Decoradores Built-in do NestJS

| Decorador | O que faz | Exemplo |
|-----------|-----------|---------|
| `@Controller()` | Define a rota base | `@Controller('users')` |
| `@Get()` | Rota GET | `@Get(':id')` → GET /users/:id |
| `@Post()` | Rota POST | `@Post()` → POST /users |
| `@Patch()` | Rota PATCH | `@Patch(':id')` → PATCH /users/:id |
| `@Delete()` | Rota DELETE | `@Delete(':id')` → DELETE /users/:id |
| `@Body()` | Extrai body da requisição | `@Body() dto: CreateUserDto` |
| `@Param()` | Extrai parâmetros de URL | `@Param('id') id: string` |
| `@Query()` | Extrai query params | `@Query('page') page: number` |
| `@Headers()` | Extrai headers | `@Headers('authorization') token: string` |
| `@UseGuards()` | Aplica guards | `@UseGuards(JwtAuthGuard)` |
| `@UseInterceptors()` | Aplica interceptors | `@UseInterceptors(LoggingInterceptor)` |

---

## Exemplo Prático Completo

```typescript
// appointments.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { User } from '@/modules/auth/entities/user.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard) // Todos os endpoints precisam JWT
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Qualquer pessoa autenticada pode ver seus próprios agendamentos
  @Get('my-appointments')
  async getMyAppointments(@CurrentUser() user: User) {
    return this.appointmentsService.findByEmployee(user.id);
  }

  // Admin vê todos
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAll() {
    return this.appointmentsService.findAll();
  }

  // Qualquer um cria agendamento
  @Post()
  async create(
    @Body() createDto: CreateAppointmentDto,
    @CurrentUser() user: User,
  ) {
    return this.appointmentsService.create(createDto, user.id);
  }

  // Apenas admin pode deletar
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.appointmentsService.delete(id);
  }
}
```

**Fluxo:**
1. Request chega com JWT token
2. `JwtAuthGuard` valida token → extrai user → coloca em `request.user`
3. `@CurrentUser()` injeta `request.user` como parâmetro
4. `@Roles('admin')` define que precisa role='admin'
5. `RolesGuard` valida role
6. Se tudo OK → método executa com `user` já pronto

---

## Boas Práticas

✅ **Use decoradores para:**
- Injetar usuário autenticado
- Definir permissões (RBAC)
- Adicionar metadados
- Marcar funcionalidades especiais

❌ **Evite:**
- Lógica pesada em decoradores
- Decoradores sem Guards correspondentes
- Decoradores aninhados sem motivo

---

## Próximos Passos
- Ler [Receita 05: Guards](./05_GUARDS.md)
- Ler [Receita 06: Validadores](./06_VALIDADORES.md)
- Ler [Receita 09: Testes](./09_TESTES.md)
