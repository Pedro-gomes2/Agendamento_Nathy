# 📚 Receita 00: Setup e Instalação do Projeto

## Objetivo
Configurar o ambiente de desenvolvimento para o backend Salão Nathy (NestJS 10+ com TypeORM, PostgreSQL e JWT).

## Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn
- PostgreSQL 14+ (local ou Supabase)
- Git

## Passo 1: Clonar e Instalar Dependências

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/salao_nathy_backend.git
cd salao_nathy_backend

# Instalar dependências
npm install
```

## Passo 2: Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# Database (Supabase ou PostgreSQL local)
DATABASE_HOST=db.afrhrdjxnwwwqieltdrx.supabase.co
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=sua_senha_aqui
DATABASE_NAME=postgres
DATABASE_SSL=true
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=false

# JWT
JWT_SECRET=sua_chave_super_secreta_aqui
JWT_EXPIRATION=7d

# Server
NODE_ENV=development
PORT=3001

# Redis (opcional, para caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# Sentry (opcional, para monitoring)
SENTRY_DSN=sua_url_sentry_aqui
```

## Passo 3: Executar Migrações do Banco

```bash
# Sincronizar schema (desenvolvimento)
npm run typeorm:sync

# Ou criar migrações (produção)
npm run typeorm:migration:generate
npm run typeorm:migration:run
```

## Passo 4: Iniciar o Servidor

```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

Servidor rodando em: `http://localhost:3001`
Swagger API Docs: `http://localhost:3001/api/docs`

## Passo 5: Testar Autenticação

```bash
# Fazer login (retorna JWT token)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salao.com",
    "password": "senha123"
  }'

# Resposta esperada:
# { "access_token": "eyJhbGciOi..." }
```

## Estrutura de Pastas Gerada

```
src/
├── common/
│   ├── config/
│   ├── decorators/
│   ├── dtos/
│   ├── filters/
│   ├── guards/
│   ├── pipes/
│   └── validators/
├── modules/
│   ├── auth/
│   │   ├── entities/
│   │   ├── dto/
│   │   ├── strategy/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── auth.controller.ts
│   ├── appointments/
│   ├── services/
│   ├── users/
│   ├── financial/
│   └── admin/
├── app.module.ts
└── main.ts
```

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Inicia em modo development com hot reload |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm run test` | Executa testes unitários |
| `npm run test:e2e` | Executa testes E2E |
| `npm run lint` | Valida código com ESLint |

## Troubleshooting

### Erro: "ECONNREFUSED" ao conectar banco
- Verificar se PostgreSQL/Supabase está rodando
- Testar conexão: `psql -h host -U usuario -d database`
- Verificar variáveis `.env`
- Se Supabase: habilitar "Allow all access" em Settings → Database → Network

### Erro: "JWT_SECRET undefined"
- Garantir que `dotenv.config()` está no topo de `main.ts` (ANTES de imports)
- Verificar `.env` tem `JWT_SECRET=`

### Erro: "Entity not found"
- Verificar imports usam `/entities/` (plural, não `/entity/`)
- Rodar `npm run build` para compilar

## Próximos Passos
- Ler [Receita 01: Módulos](./01_MODULOS.md)
- Ler [Receita 02: Entidades](./02_ENTIDADES.md)
- Executar testes E2E: [Receita 09: Testes](./09_TESTES.md)
