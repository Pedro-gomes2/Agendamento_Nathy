# 📚 Receita 05: Guards de Autenticação e Autorização

## Objetivo
Proteger endpoints validando JWT token (autenticação) e roles (autorização).

## O que é um Guard?

Um **Guard** é middleware que decide se uma requisição pode continuar. Exemplo:

```typescript
// Sem Guard (qualquer um acessa)
@Get('admin-data')
getAdminData() {
  return { secret: 'top secret' };
}

// Com Guard (só admin)
@Get('admin-data')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
getAdminData() {
  return { secret: 'top secret' };
}
```

---

## Guards do Salão Nathy

### 1️⃣ JwtAuthGuard (common/guards/jwt-auth.guard.ts)

**O que faz:** Valida se o JWT token é válido

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Como usar:**

```typescript
@Controller('appointments')
export class AppointmentsController {
  @Get('my-appointments')
  @UseGuards(JwtAuthGuard) // Precisa JWT válido
  async getMyAppointments(@CurrentUser() user: User) {
    return this.appointmentsService.findByEmployee(user.id);
  }
}
```

**Fluxo:**
1. Request chega com header `Authorization: Bearer eyJhb...`
2. Guard extrai token
3. Guard valida assinatura com `JWT_SECRET`
4. Se válido → extrai payload (user) → coloca em `request.user`
5. Se inválido → retorna 401 Unauthorized

**Exemplo de Requisição:**

```bash
curl -X GET http://localhost:3001/api/v1/appointments/my-appointments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Sem token:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### 2️⃣ RolesGuard (common/guards/roles.guard.ts)

**O que faz:** Valida se o usuário tem a role necessária

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) return true; // Sem @Roles = permite tudo

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Verifica se user.role está em requiredRoles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado. Roles necessárias: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
```

**Como usar:**

```typescript
@Controller('admin')
export class AdminController {
  // Só admin pode acessar
  @Post('create-employee')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createEmployee(@Body() dto: RegisterEmployeeDto) {
    return this.adminService.createEmployee(dto);
  }

  // Admin OU employee pode acessar
  @Get('my-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employee')
  async getMyInfo(@CurrentUser() user: User) {
    return user;
  }
}
```

**Fluxo:**
1. JwtAuthGuard já passou (token válido, user extraído)
2. RolesGuard lê metadado `@Roles(...)` do método
3. Compara `user.role` com rolesPermitidas
4. Se match → permite continuar
5. Se não match → retorna 403 Forbidden

**Tentativa de Acesso Sem Permissão:**

```bash
# Employee tentando acessar endpoint de admin
curl -X POST http://localhost:3001/api/v1/admin/create-employee \
  -H "Authorization: Bearer eyJhb..." \
  -H "Content-Type: application/json" \
  -d '{"email":"nathy@salao.com","password":"123456"}'

# Resposta: 403 Forbidden
{
  "message": "Acesso negado. Roles necessárias: admin",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

## Matriz de Acesso do Salão Nathy

| Endpoint | Role Necessária | Guard |
|----------|-----------------|-------|
| `POST /auth/login` | Nenhum | - |
| `POST /auth/register-employee` | admin | JwtAuthGuard, RolesGuard |
| `GET /appointments/my-appointments` | qualquer autenticado | JwtAuthGuard |
| `GET /appointments` | admin | JwtAuthGuard, RolesGuard @Roles('admin') |
| `POST /appointments` | qualquer autenticado | JwtAuthGuard |
| `GET /services` | qualquer um | - |
| `POST /services` | admin | JwtAuthGuard, RolesGuard @Roles('admin') |
| `PATCH /services/:id` | admin | JwtAuthGuard, RolesGuard @Roles('admin') |
| `GET /financial/report` | admin | JwtAuthGuard, RolesGuard @Roles('admin') |
| `GET /financial/my-report` | employee | JwtAuthGuard, RolesGuard @Roles('employee') |

---

## Como Criar um Guard Customizado?

Exemplo: `OwnershipGuard` - validar que user só pode editar seus próprios dados

```typescript
// common/guards/ownership.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User } from '@/modules/auth/entities/user.entity';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const paramId = request.params.id;

    // User só pode editar seu próprio ID (ou admin)
    if (user.role !== 'admin' && user.id !== paramId) {
      throw new ForbiddenException('Você só pode editar seus próprios dados');
    }

    return true;
  }
}
```

Usar:
```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard, OwnershipGuard)
async update(
  @Param('id') id: string,
  @Body() dto: UpdateUserDto,
  @CurrentUser() user: User,
) {
  return this.usersService.update(id, dto);
}
```

---

## Ordem de Guards Importa!

```typescript
// ❌ ERRADO - JwtAuthGuard precisa vir primeiro
@UseGuards(RolesGuard, JwtAuthGuard)

// ✅ CERTO - JWT antes, depois Roles
@UseGuards(JwtAuthGuard, RolesGuard)

// Por quê? RolesGuard precisa de user já extraído (feito por JwtAuthGuard)
```

---

## Guards Globais vs Locais

**Global (em main.ts) - aplica a TUDO:**
```typescript
// main.ts
app.useGlobalGuards(new JwtAuthGuard(), new RolesGuard());
```

**Local (em controller/método) - aplica só ali:**
```typescript
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
getAll() {}
```

**Recomendação:** Use locais, é mais explícito e controlável.

---

## Exemplo Prático: Bloqueio de Segurança Funcionando

```typescript
// Caso real: funcionária tentando ver agenda de colega

@Controller('appointments')
@UseGuards(JwtAuthGuard) // Precisa estar logada
export class AppointmentsController {
  @Get('my-appointments')
  async getMyAppointments(@CurrentUser() user: User) {
    // Se user.role é 'employee', retorna só seus agendamentos
    return this.appointmentsService.findByEmployee(user.id);
  }

  @Get() // Sem "my-", acesso geral
  @UseGuards(RolesGuard)
  @Roles('admin') // ← BLOQUEIO: só admin
  async getAll() {
    // Se tentar acessar sem role='admin', leva 403
    return this.appointmentsService.findAll();
  }
}
```

**Teste de Segurança:**
```bash
# Funcionária Ana (id: 123, role: employee)
# Tentando ver agenda de colega Bruna

curl -X GET http://localhost:3001/api/v1/appointments \
  -H "Authorization: Bearer ana_token"

# Resposta: 403 Forbidden
# "Acesso negado. Roles necessárias: admin"

# Ana consegue ver apenas seus próprios:
curl -X GET http://localhost:3001/api/v1/appointments/my-appointments \
  -H "Authorization: Bearer ana_token"

# Resposta: 200 OK
# [ { id: ..., employee_id: 123, ... } ]
```

---

## Boas Práticas

✅ **Use:**
- JwtAuthGuard antes de qualquer dado protegido
- RolesGuard depois de JwtAuthGuard
- @Roles explicitamente para clareza
- Guards locais, não globais

❌ **Evite:**
- Guards sem ordem lógica
- Não aplicar guards em endpoints sensíveis
- Esquecer JWT_SECRET no .env

---

## Próximos Passos
- Ler [Receita 06: Validadores](./06_VALIDADORES.md)
- Ler [Receita 09: Testes](./09_TESTES.md)
- Ler [Receita 10: Deploy](./10_DEPLOY.md)
