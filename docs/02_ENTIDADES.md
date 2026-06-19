# 📚 Receita 02: Entidades e Relacionamentos

## Objetivo
Entender como modelar dados e criar relacionamentos entre entidades usando TypeORM.

## O que é uma Entity?

Uma **Entity** é a representação de uma tabela do banco de dados em TypeScript. No Salão Nathy, usamos TypeORM com PostgreSQL.

## Estrutura Básica de uma Entity

```typescript
// modules/auth/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Enum,
} from 'typeorm';
import { Appointment } from '@/modules/appointments/entities/appointment.entity';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  CLIENT = 'client',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // SEMPRE hashed com Bcrypt!

  @Enum(() => UserRole)
  @Column({ default: UserRole.CLIENT })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos (vem depois)
  @OneToMany(() => Appointment, (appt) => appt.employee)
  appointments: Appointment[];
}
```

## Decoradores Essenciais

| Decorador | O que faz | Exemplo |
|-----------|-----------|---------|
| `@Entity()` | Define a entidade e nome da tabela | `@Entity('users')` |
| `@PrimaryGeneratedColumn()` | Chave primária (auto-increment) | `id: string` (uuid) |
| `@Column()` | Coluna simples | `email: string` |
| `@Column({ unique: true })` | Coluna com constraint UNIQUE | Email não duplica |
| `@Column({ default: true })` | Valor padrão | `is_active: boolean` |
| `@Enum()` | Coluna de enum (restricted values) | `role: UserRole` |
| `@CreateDateColumn()` | Timestamp de criação (automático) | `created_at: Date` |
| `@UpdateDateColumn()` | Timestamp de atualização (automático) | `updated_at: Date` |

---

## Tipos de Dados PostgreSQL

```typescript
@Column()
nome: string;  // VARCHAR

@Column({ type: 'text' })
descricao: string;  // TEXT (mais longo que VARCHAR)

@Column({ type: 'integer' })
idade: number;  // INTEGER

@Column({ type: 'decimal', precision: 10, scale: 2 })
preco: number;  // DECIMAL(10,2) - perfeito para preços!

@Column({ type: 'timestamp' })
data_hora: Date;  // TIMESTAMP - para PostgreSQL

@Column({ type: 'boolean', default: false })
ativo: boolean;  // BOOLEAN
```

---

## Relacionamentos (Relations)

Salão Nathy usa 3 tipos de relacionamentos:

### 1. OneToMany: Uma User tem vários Appointments

```typescript
// modules/auth/entities/user.entity.ts
@OneToMany(() => Appointment, (appt) => appt.employee)
appointments: Appointment[];
```

```typescript
// modules/appointments/entities/appointment.entity.ts
@ManyToOne(() => User, (user) => user.appointments)
@JoinColumn({ name: 'employee_id' })
employee: User;
```

**No banco:**
```
users table:
  id (PK)
  email

appointments table:
  id (PK)
  employee_id (FK) → users.id  ← Chave estrangeira!
```

### 2. ManyToOne: Muitos Appointments para Um Service

```typescript
// modules/appointments/entities/appointment.entity.ts
@ManyToOne(() => Service, (service) => service.appointments)
@JoinColumn({ name: 'service_id' })
service: Service;
```

```typescript
// modules/services/entities/service.entity.ts
@OneToMany(() => Appointment, (appt) => appt.service)
appointments: Appointment[];
```

### 3. ManyToOne: Muitos FinancialTransactions para Um User (Comissões)

```typescript
// modules/financial/entities/financial-transaction.entity.ts
@ManyToOne(() => User)
@JoinColumn({ name: 'employee_id' })
employee: User;
```

---

## Todas as Entidades do Salão Nathy

### 1️⃣ User (auth/entities/user.entity.ts)

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed com Bcrypt!

  @Enum(() => UserRole)
  @Column({ default: UserRole.CLIENT })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  commission_rate?: number; // Percentual de comissão (ex: 30%)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appt) => appt.employee)
  appointments: Appointment[];

  @OneToMany(() => FinancialTransaction, (trans) => trans.employee)
  financial_transactions: FinancialTransaction[];
}
```

**Validações:**
- Email é UNIQUE
- Senha é SEMPRE hashed (nunca stored em plain text!)
- Role é ENUM (só admin, employee, client)
- commission_rate é nullable (só relevante para employees)

---

### 2️⃣ Service (services/entities/service.entity.ts)

```typescript
@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // "Corte", "Escova", etc

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Preço em R$

  @Column()
  duration_minutes: number; // Quanto tempo demora

  @Column({ nullable: true })
  image_url: string; // URL da imagem (validada!)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Appointment, (appt) => appt.service)
  appointments: Appointment[];
}
```

**Validações:**
- `price` usa DECIMAL(10,2) para evitar problemas com floats
- `image_url` é validado (HTTPS, extensões .jpg, .png, .webp, .gif, .svg)
- `duration_minutes` é número inteiro positivo

---

### 3️⃣ Appointment (appointments/entities/appointment.entity.ts)

```typescript
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

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column()
  employee_id: string; // FK

  @ManyToOne(() => Service, (service) => service.appointments)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column()
  service_id: string; // FK

  @Column()
  client_phone: string; // Contato do cliente

  @Column({ type: 'timestamp' })
  date_time: Date; // Data e hora do agendamento

  @Enum(() => AppointmentStatus)
  @Column({ default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Validações:**
- `date_time` tipo TIMESTAMP (PostgreSQL nativo)
- `status` é ENUM (pending, confirmed, completed, cancelled)
- Prevenção de double-booking: não pode 2 agendamentos mesma employee no mesmo horário
- Employee só pode ver seus próprios agendamentos

---

### 4️⃣ FinancialTransaction (financial/entities/financial-transaction.entity.ts)

```typescript
export enum TransactionType {
  ENTRY = 'entry',    // Receita
  EXIT = 'exit',      // Despesa
}

@Entity('financial_transactions')
export class FinancialTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Enum(() => TransactionType)
  @Column()
  type: TransactionType; // Entrada ou saída

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @ManyToOne(() => User, (user) => user.financial_transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee?: User; // Nulo para transações gerais do salão

  @Column({ nullable: true })
  employee_id?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  commission?: number; // Comissão calculada

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Lógica de Comissão:**
- Cada agendamento confirmado gera 1 ENTRY (receita)
- Sistema calcula: `commission = total_revenue * commission_rate / 100`
- Comissão gravada na transaction

---

## Índices de Banco (Performance)

```typescript
@Entity('appointments')
@Index(['employee_id'])
@Index(['employee_id', 'status'])
@Index(['date_time', 'status'])
export class Appointment {
  // ... columns
}
```

**Índices Criados:**
- `appointments(employee_id)` - buscar agendamentos por funcionária
- `appointments(employee_id, status)` - filtrar por funcionária E status
- `appointments(date_time DESC)` - ordenar por data decrescente
- `financial_transactions(date DESC)` - relatórios por período
- `financial_transactions(employee_id)` - comissões por funcionária
- `users(email)` - login único
- `users(is_active)` - filtrar ativas

---

## Como Criar uma Nova Entity?

Exemplo: adicionar `reviews/` para avaliações de serviços

```typescript
// modules/reviews/entities/review.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@/modules/auth/entities/user.entity';
import { Service } from '@/modules/services/entities/service.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column()
  client_id: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column()
  service_id: string;

  @Column({ type: 'integer' })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  created_at: Date;
}
```

Depois, atualizar:
1. `src/config/database.config.ts` - add `Review` aos entities
2. `src/data-source.ts` - add `Review` aos entities
3. `reviews.module.ts` - importar TypeOrmModule.forFeature([Review])

---

## Próximos Passos
- Ler [Receita 03: DTOs](./03_DTOS.md)
- Ler [Receita 08: Controladores](./08_CONTROLADORES.md)
- Ler [Receita 09: Testes](./09_TESTES.md)
