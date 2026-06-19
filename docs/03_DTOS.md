# 📚 Receita 03: DTOs e Validação

## Objetivo
Aprender a criar e validar dados de entrada usando DTOs (Data Transfer Objects).

## O que é um DTO?

Um **DTO** é uma classe que define e valida os dados que chegam em uma requisição HTTP. Exemplo:

```typescript
// Sem DTO (RUIM - sem validação)
@Post('login')
login(body: any) {
  // Qualquer coisa entra!
}

// Com DTO (BOM - validado)
@Post('login')
login(@Body() loginDto: LoginDto) {
  // Só strings email/password válidas entram
}
```

---

## Instalação de Validadores

Já está incluído no projeto:

```bash
npm install class-validator class-transformer
```

---

## DTOs do Salão Nathy

### 1️⃣ Auth DTOs

#### LoginDto (auth/dto/login.dto.ts)

```typescript
import { IsEmail, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @MaxLength(50)
  password: string;
}
```

**Validações:**
- `email` DEVE ser email válido
- `password` DEVE ter 6-50 caracteres

**Exemplo de Requisição Válida:**
```json
{
  "email": "nathy@salao.com",
  "password": "senha123"
}
```

**Exemplo de Requisição Inválida (retorna 400):**
```json
{
  "email": "invalido",  // ❌ Não é email
  "password": "123"     // ❌ Muito curta
}
```

Resposta de erro:
```json
{
  "message": [
    "Email deve ser válido",
    "Senha deve ter no mínimo 6 caracteres"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

#### RegisterEmployeeDto (auth/dto/register-employee.dto.ts)

```typescript
import {
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class RegisterEmployeeDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number; // % de comissão (0-100)
}
```

**Validações:**
- Email é UNIQUE (verificado em service)
- Senha será hashed com Bcrypt antes de salvar
- commission_rate é opcional, deve estar 0-100

---

### 2️⃣ Services DTOs

#### CreateServiceDto (services/dto/create-service.dto.ts)

```typescript
import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { IsImageUrl } from '@/common/validators/image-url.validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string; // "Corte Básico"

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number; // 50.00

  @IsNumber()
  @IsPositive()
  duration_minutes: number; // 30

  @IsOptional()
  @IsImageUrl() // Validador customizado!
  image_url?: string; // https://example.com/corte.jpg
}
```

**Validadores Customizados:**
- `@IsImageUrl()` - valida se URL é HTTPS e extensão é .jpg, .png, .webp, .gif, .svg

---

#### UpdateServiceDto (services/dto/update-service.dto.ts)

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  // Todos os campos são opcionais (só atualiza o que for enviado)
}
```

**Como funciona:**
```typescript
// PartialType transforma todos os campos em Optional
// CreateServiceDto: { name, description?, price, duration_minutes, image_url? }
// UpdateServiceDto: { name?, description?, price?, duration_minutes?, image_url? }
```

---

### 3️⃣ Appointments DTOs

#### CreateAppointmentDto (appointments/dto/create-appointment.dto.ts)

```typescript
import { IsUUID, IsISO8601, IsPhoneNumber } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  service_id: string; // ID do serviço

  @IsISO8601()
  date_time: string; // "2024-03-15T10:30:00Z"

  @IsPhoneNumber('BR')
  client_phone: string; // "(11) 98765-4321"
}
```

**Validações:**
- `service_id` DEVE ser UUID válido
- `date_time` DEVE ser ISO8601 (padrão internacional)
- `client_phone` DEVE ser número BR válido

**Exemplo Válido:**
```json
{
  "service_id": "550e8400-e29b-41d4-a716-446655440000",
  "date_time": "2024-03-15T10:30:00Z",
  "client_phone": "+55 11 98765-4321"
}
```

---

#### UpdateAppointmentStatusDto

```typescript
import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '@/modules/appointments/entities/appointment.entity';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus; // pending, confirmed, completed, cancelled
}
```

---

### 4️⃣ Financial DTOs

#### GetFinancialReportDto (para Query Params)

```typescript
import { IsOptional, IsISO8601 } from 'class-validator';

export class GetFinancialReportDto {
  @IsOptional()
  @IsISO8601()
  start_date?: string;

  @IsOptional()
  @IsISO8601()
  end_date?: string;

  @IsOptional()
  employee_id?: string;
}
```

**Uso:**
```http
GET /api/v1/financial/report?start_date=2024-01-01&end_date=2024-03-31
```

---

## Validadores Customizados

### ImageUrlValidator (common/validators/image-url.validator.ts)

```typescript
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isImageUrl', async: false })
export class IsImageUrlConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return true; // Opcional

    // Validar HTTPS
    if (!value.startsWith('https://')) {
      return false;
    }

    // Validar extensões
    const validExtensions = ['.jpg', '.png', '.webp', '.gif', '.svg'];
    return validExtensions.some((ext) => value.toLowerCase().endsWith(ext));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Image URL deve ser HTTPS e ter extensão .jpg, .png, .webp, .gif ou .svg';
  }
}

export function IsImageUrl() {
  return registerDecorator({
    constraint: IsImageUrlConstraint,
  });
}
```

### FileSizeValidator (common/validators/file-size.validator.ts)

```typescript
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    if (value?.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Arquivo muito grande. Máximo: 5MB, enviado: ${(value.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    return value;
  }
}
```

---

## Como Usar DTOs no Controller

```typescript
// services.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin') // Apenas admin pode criar
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }
}
```

**Fluxo de Validação:**
1. Request chega com JSON
2. ValidationPipe (global) valida contra DTO
3. Se inválido → 400 Bad Request com erro detalhado
4. Se válido → DTO é passado para o método

---

## Transform Automático

```typescript
// Transformação automática de tipos
@Body() createServiceDto: CreateServiceDto
// Se enviou string "50", vira number 50 automaticamente (se enableImplicitConversion: true)
```

Configure em `main.ts`:
```typescript
new ValidationPipe({
  whitelist: true,           // Remove campos não definidos
  forbidNonWhitelisted: true, // Rejeita se houver campos extras
  transform: true,           // Transforma tipos automaticamente
  transformOptions: {
    enableImplicitConversion: true,
  },
})
```

---

## Boas Práticas

1. **Sempre validar entrada de usuário** ✅
2. **Nunca confiar em dados não validados** ✅
3. **DTOs para entrada, Entities para banco** ✅
4. **Mensagens de erro claras** ✅
5. **Reutilizar DTOs com PartialType** ✅

---

## Próximos Passos
- Ler [Receita 04: Decoradores](./04_DECORADORES.md)
- Ler [Receita 05: Guards](./05_GUARDS.md)
- Ler [Receita 09: Testes](./09_TESTES.md)
