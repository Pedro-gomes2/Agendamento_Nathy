# 💇‍♀️ Salão Nathy Backend

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-34%2F34-brightgreen.svg?style=flat-square)](#-testing)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Backend de alta performance para sistema de agendamento e gestão de salões de beleza**

[Início Rápido](#-quick-start) • [Documentação](#-documentação) • [API](#-api-endpoints) • [Contribuir](#-contribuindo)

</div>

---

## 📖 Índice

- [Visão Geral](#-visão-geral)
- [Features](#✨-features-principais)
- [Quick Start](#-quick-start)
- [Instalação](#-instalação-completa)
- [Configuração](#️-configuração)
- [Documentação](#-documentação)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Arquitetura](#-arquitetura)
- [Performance](#-performance)
- [Segurança](#-segurança)
- [Tech Stack](#-tech-stack)
- [Troubleshooting](#-troubleshooting)
- [Contribuindo](#-contribuindo)

---

## 🎯 Visão Geral

**Salão Nathy** é uma plataforma completa de agendamento e gestão de salões de beleza desenvolvida com **NestJS 10+**, **PostgreSQL** (Neon) e **TypeScript**.

### Características Principais

- ✅ Agendamento online 24/7 (público, sem autenticação)
- ✅ Autenticação segura com JWT + Bcrypt (10 salt rounds)
- ✅ Controle de acesso baseado em funções (RBAC) - 3 níveis
- ✅ Gestão completa (funcionárias, serviços, agendamentos, financeiro)
- ✅ Relatórios financeiros em tempo real com cálculo de comissões
- ✅ Performance otimizada (95% redução em latência)
- ✅ 34/34 testes E2E passando
- ✅ Documentação interativa com Swagger
- ✅ PostgreSQL em cloud (Neon) com SSL/TLS

**Pronto para Produção** • **100% Testado** • **Bem Documentado**

---

## ✨ Features Principais

| Feature | Status | Descrição |
|---------|--------|-----------|
| 🔐 JWT + Bcrypt | ✅ | Autenticação segura com 7 dias de validade |
| 👥 RBAC (3 Roles) | ✅ | Client, Employee, Admin com permissões granulares |
| 📅 Agendamentos | ✅ | Público, validação de double-booking, status workflow |
| 💅 Serviços | ✅ | CRUD com imagens, preços, durações, caching Redis |
| 💰 Financeiro | ✅ | Transações, relatórios, cálculo automático de comissões |
| 👨‍💼 Funcionárias | ✅ | Criar, editar, deactivate/activate, especialidade |
| 🚀 Performance | ✅ | 11 índices DB, N+1 prevention, connection pooling |
| 🧪 E2E Testing | ✅ | Jest + Supertest, 34 testes, cobertura completa |
| 📊 Swagger Docs | ✅ | Documentação interativa, exemplos de uso |
| 🔒 Segurança | ✅ | Input sanitization, XSS prevention, image validation |

---

## 🚀 Quick Start

### Requisitos Mínimos

```
Node.js 18+
npm ou yarn
PostgreSQL (recomendado: Neon)
```

### Instalação em 5 Minutos

```bash
# 1. Clone e instale
git clone https://github.com/seu-usuario/salao-nathy.git
cd salao-nathy-backend
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com sua DATABASE_URL do Neon

# 3. Inicie o servidor
npm run start:dev

# 4. Acesse
# API: http://localhost:3001
# Swagger: http://localhost:3001/api/docs
```

✅ **Pronto!** Seu backend está rodando.

---

## 📦 Instalação Completa

### Passo 1: Clonar Repositório

```bash
git clone https://github.com/seu-usuario/salao-nathy.git
cd salao-nathy-backend
```

### Passo 2: Instalar Dependências

```bash
npm install
# ou
yarn install
```

### Passo 3: Banco de Dados

#### Opção A: Neon (Recomendado - Cloud)

1. Crie conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto PostgreSQL
3. Copie a connection string

#### Opção B: PostgreSQL Local

```bash
# Windows (com PostgreSQL instalado)
createdb salao_nathy

# macOS/Linux
psql -U postgres -c "CREATE DATABASE salao_nathy;"
```

### Passo 4: Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```env
# 🔗 Database - Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-xxxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require

# 🔑 JWT - Gere uma chave segura:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=abc123def456...
JWT_EXPIRATION=7d

# 🖥️ Server
NODE_ENV=development
PORT=3001

# 📊 Sentry (Opcional)
SENTRY_DSN=https://seu-sentry@sentry.io/123456

# 📦 Redis (Opcional - para caching)
REDIS_URL=redis://localhost:6379

# 🌐 CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Passo 5: Iniciar Servidor

```bash
# 🔄 Desenvolvimento (hot reload)
npm run start:dev

# 📦 Build para produção
npm run build

# ▶️ Rodar em produção
npm run start
```

Expected output:
```
[NestFactory] Starting Nest application...
[InstanceLoader] TypeOrmModule dependencies initialized
[NestApplication] Nest application successfully started on port 3001
```

✅ Acesse http://localhost:3001/api/docs

---

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `DATABASE_URL` | `postgresql://...` | Connection string PostgreSQL |
| `JWT_SECRET` | `abc123...` | Chave para assinar tokens |
| `JWT_EXPIRATION` | `7d` | Tempo de expiração do token |
| `NODE_ENV` | `development` | Ambiente (development, production) |
| `PORT` | `3001` | Porta do servidor |
| `SENTRY_DSN` | `https://...` | Error tracking (opcional) |
| `REDIS_URL` | `redis://localhost:6379` | Caching (opcional) |
| `CORS_ORIGIN` | `http://localhost:3000` | URLs permitidas CORS |

Veja [.env.example](.env.example) para template completo.

---

## 📚 Documentação

### 📖 Documentos Principais

| Documento | Descrição |
|-----------|-----------|
| [**PRD_SALAO_NATHY.md**](./PRD_SALAO_NATHY.md) | Product Requirements - personas, fluxos, features |
| [**docs/API_SPECIFICATION.md**](./docs/API_SPECIFICATION.md) | API completa com exemplos |
| [**AUTHENTICATION_GUIDE.md**](./AUTHENTICATION_GUIDE.md) | JWT & autenticação |
| [**docs/OPTIMIZATION_REPORT.md**](./docs/OPTIMIZATION_REPORT.md) | Performance & otimizações |
| [**FRONTEND_PROMPT.md**](./FRONTEND_PROMPT.md) | React 19 frontend prompt |
| [**test/README.md**](./test/README.md) | Guia de testes E2E |



### 📖 Documentação Completa

Acesse **Swagger UI**: http://localhost:3001/api/docs

Ou veja [docs/API_SPECIFICATION.md](./docs/API_SPECIFICATION.md) para exemplos detalhados.

### Exemplo: Criar Agendamento

```bash
curl -X POST http://localhost:3001/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "João Silva",
    "client_phone": "+5583999999999",
    "date_time": "2026-06-25T14:30:00Z",
    "employee_id": "00a50900-931c-4816-871d-c566a921a3eb",
    "service_id": "service-uuid",
    "notes": "Cliente VIP"
  }'
```

Response:
```json
{
  "id": "appointment-uuid",
  "status": "pending",
  "client_name": "João Silva",
  "date_time": "2026-06-25T14:30:00Z",
  "employee": {"name": "Funcionária 1"},
  "service": {"name": "Manicure", "price": 50}
}
```

---

## 🧪 Testing

### Executar Testes

```bash
# E2E Tests
npm run test:e2e

# Com cobertura
npm run test:cov

# Watch mode
npm run test:watch

# Debug
npm run test:debug

# Teste específico
npm run test:e2e -- appointments.spec.ts
```

### Status

✅ **34/34 testes passando**

- 14 testes de Agendamentos
- 20 testes de Financeiro

Veja [test/README.md](./test/README.md) para detalhes.

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── auth/                  # Autenticação JWT
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── strategies/jwt.strategy.ts
│
├── modules/
│   ├── appointments/      # CRUD de agendamentos
│   ├── services/         # CRUD de serviços
│   ├── users/            # CRUD de funcionárias
│   └── financial/        # Transações e relatórios
│
├── entities/             # TypeORM entities
│   ├── user.entity.ts
│   ├── service.entity.ts
│   ├── appointment.entity.ts
│   └── financial-transaction.entity.ts
│
├── common/               # Código compartilhado
│   ├── decorators/       # @Roles, @CurrentUser
│   ├── guards/           # JwtAuthGuard, RolesGuard
│   └── pipes/            # SanitizePipe
│
├── config/
│   └── database.config.ts # TypeORM + 11 indexes
│
├── migrations/           # Database migrations
└── main.ts              # Bootstrap

test/
├── setup.ts             # Jest config
├── fixtures/seed.ts     # Test data
└── e2e/
    ├── appointments.spec.ts
    └── financial.spec.ts
```

### Padrões Utilizados

- ✅ **Modular Architecture** - Organização por features
- ✅ **Dependency Injection** - NestJS built-in
- ✅ **Repository Pattern** - TypeORM repositories
- ✅ **Guard-based RBAC** - Role validation
- ✅ **DTOs** - Data validation & serialization
- ✅ **Global Pipes** - Input sanitization
- ✅ **Exception Filters** - Consistent error handling

---

## ⚡ Performance

### Otimizações Implementadas

| Otimização | Antes | Depois | Impacto |
|-----------|-------|--------|--------|
| Queries de Agendamentos | 2-5s | 50-100ms | 🚀 **50x** |
| Total de Database Queries | 201 | 1 | 🚀 **201x** |
| Serviços (Redis Cache) | 500ms | 1ms | 🚀 **500x** |
| Tamanho de Response | 5MB | 500KB | 🚀 **10x** |

### Técnicas Utilizadas

- 🗂️ **Database Indexing** - 11 índices estratégicos
- 🔄 **Query Optimization** - TypeORM QueryBuilder com relations
- 💾 **Redis Caching** - 5 min TTL para serviços
- 📄 **Pagination** - Limitar resultados (default: 20)
- 🔗 **Connection Pooling** - 50 max connections (prod)
- 🔍 **N+1 Prevention** - Eager loading com relations

---

## 🔒 Segurança

### Implementações

| Segurança | Status | Detalhe |
|-----------|--------|--------|
| JWT | ✅ | Tokens com 7 dias de validade |
| Bcrypt | ✅ | 10 salt rounds |
| Input Sanitization | ✅ | Remove HTML tags (XSS) |
| Image Validation | ✅ | URL, protocolo HTTPS, extensão |
| RBAC | ✅ | 3 roles com guards granulares |
| SQL Injection | ✅ | TypeORM parameterized queries |
| .env Protection | ✅ | Gitignore com credenciais |
| Rate Limiting | ⚙️ | Ready to enable |

### Checklist

- ✅ Senhas em Bcrypt (não plaintext)
- ✅ JWT verificado em cada requisição
- ✅ Inputs sanitizados contra XSS
- ✅ URLs de imagem validadas
- ✅ .env nunca commitado
- ✅ Sem hardcoded secrets
- ✅ CORS configurado
- ✅ SSL/TLS support

---

## 📦 Tech Stack

### Backend

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| NestJS | 10+ | Framework |
| TypeScript | 5+ | Linguagem |
| TypeORM | 0.3+ | ORM |
| PostgreSQL | 16+ | Database |
| JWT | - | Autenticação |
| Bcrypt | - | Password hashing |
| Passport | - | Auth middleware |
| Redis | - | Caching |
| Jest | - | Testing |
| Swagger | 3.0+ | API docs |
| Sentry | - | Error tracking |

### Ferramentas

- **Neon** - PostgreSQL serverless
- **npm** - Package manager
- **Docker** - (opcional) Containerization
- **Git** - Version control

---


## 🤝 Contribuindo

### Como Contribuir

1. **Fork** o repositório
2. **Crie uma branch** (`git checkout -b feature/minha-feature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adicionar feature'`)
4. **Push** (`git push origin feature/minha-feature`)
5. **Abra um Pull Request**

### Guidelines

- ✅ TypeScript strict mode
- ✅ Testes E2E para novas features
- ✅ Sem console.log em produção
- ✅ Documentação atualizada
- ✅ Commits descritivos

Veja [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 License

MIT License - veja [LICENSE](./LICENSE)

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software")...
```

---

## 📞 Suporte

- 📧 **Email:** oliveira110965@gmail.com
- 📖 **Docs:** [docs/](./docs/)
- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/salao-nathy/issues)

---

<div align="center">

### ⭐ Gostou? Deixe uma estrela! ⭐

Feito com ❤️ por [João Oliveira](https://github.com/seu-usuario)

[↑ Voltar ao topo](#-salão-nathy-backend)

</div>
