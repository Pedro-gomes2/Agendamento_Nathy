# 💇‍♀️ Salão Nathy - Sistema de Agendamento & Gestão

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg)](https://www.postgresql.org/)

Backend de alta performance para sistema de agendamento e gestão de salões de beleza. Production-ready com autenticação JWT, RBAC, otimizações de performance e testes E2E completos.

---

## 🎯 Features Principais

✅ **Agendamento Online 24/7** - Público, sem autenticação  
✅ **Autenticação JWT** - Bcrypt + tokens com 7 dias de validade  
✅ **RBAC** - 3 roles: Client, Employee, Admin  
✅ **Gestão Completa** - Funcionárias, serviços, agendamentos, financeiro  
✅ **Relatórios Financeiros** - Receitas, despesas, comissões por funcionária  
✅ **Performance** - 95% redução em latência, queries otimizadas, caching Redis  
✅ **E2E Testing** - 34 testes automatizados cobrindo todos os cenários  
✅ **Segurança** - Input sanitization, XSS prevention, rate limiting ready  
✅ **Swagger Docs** - Documentação interativa completa  
✅ **Neon PostgreSQL** - Banco em produção com SSL/TLS

---

## 🚀 Quick Start

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- PostgreSQL (Neon) connection string

### **Instalação**

```bash
# Clone o repositório
git clone <repo-url>
cd salao_nathy_backend

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Neon PostgreSQL
```

### **Variáveis de Ambiente (.env)**

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRATION=7d

# Server
NODE_ENV=development
PORT=3001

# Sentry (opcional)
SENTRY_DSN=https://...
```

### **Rodar Localmente**

```bash
# Desenvolvimento
npm run start:dev

# Build para produção
npm run build

# Rodar em produção
npm run start
```

**Backend disponível em:** http://localhost:3001  
**Swagger Docs:** http://localhost:3001/api/docs

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [PRD_SALAO_NATHY.md](./PRD_SALAO_NATHY.md) | Product Requirements |
| [docs/API_SPECIFICATION.md](./docs/API_SPECIFICATION.md) | Endpoints completos |
| [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) | JWT & Login |
| [docs/OPTIMIZATION_REPORT.md](./docs/OPTIMIZATION_REPORT.md) | Performance details |
| [FRONTEND_PROMPT.md](./FRONTEND_PROMPT.md) | React 19 frontend |

---

## 🧪 Testing

```bash
# E2E tests
npm run test:e2e

# Com cobertura
npm run test:cov

# Watch mode
npm run test:watch

# Debug
npm run test:debug
```

**Status:** ✅ 34/34 testes passando

---

## 🔐 Credenciais Teste

```
Admin:
  Email: admin@salao.com
  Password: admin123456

Employee:
  Email: employee1@salao.com
  Password: password123
```

---

## 📋 Principais Endpoints

```
POST   /auth/login
POST   /auth/register-employee       (admin)
GET    /appointments
POST   /appointments                 (public)
GET    /appointments/my-appointments (employee)
CRUD   /services
CRUD   /users
CRUD   /financial/*
```

Documentação completa: [docs/API_SPECIFICATION.md](./docs/API_SPECIFICATION.md)

---

## ⚡ Performance

| Otimização | Antes | Depois | Status |
|-----------|-------|--------|--------|
| Appointment queries | 2-5s | 50-100ms | ✅ |
| Database queries | 201 | 1 | ✅ |
| Service cache | 500ms | 1ms | ✅ |
| Response size | 5MB | 500KB | ✅ |

---

## 🏗️ Arquitetura

```
src/
├── auth/              JWT + Bcrypt
├── appointments/      CRUD + validações
├── services/          Com image validation
├── users/             RBAC
├── financial/         Transações & Relatórios
├── common/            Decorators, Guards, Pipes
├── migrations/        11 Database indexes
└── config/            Database, Cache, Sentry
```

---

## 🔒 Segurança

✅ JWT Authentication + Bcrypt (10 rounds)  
✅ Input Sanitization (XSS prevention)  
✅ Image URL Validation  
✅ RBAC (3 roles)  
✅ SQL Injection Prevention  
✅ Rate Limiting ready

---

## 📦 Tech Stack

- **Framework:** NestJS 10+
- **Language:** TypeScript 5+
- **Database:** PostgreSQL (Neon) 16+
- **ORM:** TypeORM 0.3+
- **Auth:** JWT + Passport.js
- **Hashing:** Bcrypt
- **Caching:** Redis
- **Testing:** Jest + Supertest
- **Docs:** Swagger 3.0+

---

## 🐛 Troubleshooting

**"Unauthorized" error**
```
Verificar header Authorization: Bearer token
```

**"Database connection refused"**
```
Verificar DATABASE_URL em .env
```

**"Port 3001 already in use"**
```
Mudar PORT em .env ou matar processo na porta
```

---

## 📱 Frontend

Frontend React 19 pronto para integração!

Leia: [FRONTEND_PROMPT.md](./FRONTEND_PROMPT.md)

---

## 📞 Contato

Email: oliveira110965@gmail.com

---

## 📄 License

MIT License - [LICENSE](./LICENSE)

---

**Status:** ✅ PRODUCTION READY v1.0.0

```bash
npm install && npm run start:dev
# http://localhost:3001/api/docs
```
