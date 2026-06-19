# 📚 Receita 10: Deploy no Render com Supabase PostgreSQL

## Objetivo
Fazer deploy automático da API NestJS no Render usando Supabase como banco PostgreSQL.

---

## Arquitetura do Deploy

```
GitHub (seu código)
    ↓ (git push)
Render (constrói + roda)
    ↓ (conecta)
Supabase PostgreSQL
    ↓ (armazena dados)
Frontend (consome API)
```

---

## Passo 1: Criar Projeto no Render

### 1.1 Acesar Render Dashboard
- Ir para https://dashboard.render.com
- Fazer login (ou criar conta)

### 1.2 Criar novo "Web Service"
- Clicar "+ New" → "Web Service"
- Conectar repositório GitHub
- Selecionar `salao_nathy_backend`
- Clicar "Deploy"

### 1.3 Configurar Variáveis de Ambiente

Na dashboard do Render, clicar em Environment:

```env
# Database (Supabase)
DATABASE_HOST=db.afrhrdjxnwwwqieltdrx.supabase.co
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=sua_senha_supabase
DATABASE_NAME=postgres
DATABASE_SSL=true
DATABASE_SYNCHRONIZE=false

# JWT
JWT_SECRET=gere_uma_chave_super_secreta_aleatoria
JWT_EXPIRATION=7d

# Server
NODE_ENV=production
PORT=10000

# Sentry (opcional)
SENTRY_DSN=sua_url_sentry_aqui
```

**Como gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6... (copiar e colar em JWT_SECRET)
```

---

## Passo 2: Configurar Supabase

### 2.1 Criar projeto Supabase
- Ir para https://supabase.com
- Dashboard → "New Project"
- Nome: "salao_nathy"
- Região: "South America (São Paulo)" se possível
- Database password: salvar em local seguro
- Clicar "Create new project"

### 2.2 Obter Connection String
1. Na dashboard Supabase, ir para "Settings" → "Database"
2. Copiar "Connection string" (abaixo do postgres:// URL)
3. Substituir:
   - `[YOUR-PASSWORD]` pela password do banco
   - Adicionar `?sslmode=require`

Exemplo:
```
postgresql://postgres:Nathy@!2026@db.afrhrdjxnwwwqieltdrx.supabase.co:5432/postgres?sslmode=require
```

### 2.3 Habilitar Network Access

⚠️ **CRÍTICO:** Render precisa conseguir conectar ao Supabase!

1. Supabase Dashboard → "Settings" → "Database" → "Network restrictions"
2. Clicar "Allow all access"
3. Confirmar

---

## Passo 3: Conectar GitHub (CI/CD)

### 3.1 Enable Auto-Deploy

No Render, seu serviço aparece em Dashboard.

1. Clicar no serviço
2. Ir para "Settings"
3. Procurar "Auto-Deploy"
4. Selecionar "Yes" para branch main

**Resultado:** A cada `git push` para main, Render faz deploy automaticamente!

---

## Passo 4: Testar Deploy

### 4.1 Fazer Push para GitHub

```bash
git add .
git commit -m "chore: align structure to Generation Cookbook pattern"
git push origin main
```

### 4.2 Acompanhar Deploy no Render

1. Dashboard Render → seu serviço
2. Clicar "Logs"
3. Ver output da build:

```
[Buildtime 0m45s]
...
✅ API rodando em http://seu-app.onrender.com:10000
📚 Swagger: http://seu-app.onrender.com:10000/api/docs
```

### 4.3 Acessar Swagger

Abrir no browser:
```
https://seu-app.onrender.com/api/docs
```

Deve aparecer documentação Swagger com todos os endpoints!

### 4.4 Testar Login

```bash
curl -X POST https://seu-app.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salao.com",
    "password": "admin123"
  }'

# Resposta esperada:
# {"access_token":"eyJhb..."}
```

---

## Passo 5: Database Migrations em Produção

Se usou `DATABASE_SYNCHRONIZE=true`:
- Schema é criado automaticamente ✅

Se usou migrações TypeORM:
```bash
# Rodar migrações manualmente no Render
render:build → npm run typeorm:migration:run
```

Ou em `package.json`, adicionar script:
```json
{
  "scripts": {
    "postinstall": "npm run typeorm:migration:run"
  }
}
```

---

## Passo 6: Monitoramento (Opcional)

### Sentry para Monitoring

1. Criar conta em https://sentry.io
2. Criar projeto "Nest"
3. Copiar DSN
4. Adicionar no Render Environment: `SENTRY_DSN=...`
5. Pronto! Erros aparecem em Sentry dashboard

### Logs do Render

Sempre disponíveis em:
```
https://dashboard.render.com → seu-app → Logs
```

---

## Troubleshooting de Deploy

### ❌ Erro: "ECONNREFUSED 5432"
```
Solution:
1. Verificar DATABASE_HOST está correto
2. Supabase: habilitar "Allow all access" em Network
3. Verificar DATABASE_PASSWORD está correto
```

### ❌ Erro: "Database synchronize failed"
```
Solution:
1. DATABASE_SYNCHRONIZE=false em produção (use migrações)
2. Ou: criar tabelas manualmente em Supabase
```

### ❌ Erro: "JWT_SECRET undefined"
```
Solution:
1. Render Environment → adicionar JWT_SECRET
2. Render → redeploy (botão "Manual Deploy")
```

### ❌ Erro: Build timeout (> 60s)
```
Solution:
1. npm install demora muito
2. Render pode cancelar build
3. Solução: cleanup node_modules, reinstalar
```

### ✅ Deploy Sucesso

Log esperado:
```
[Buildtime 0m32s]
▶ Building...
...
✅ Compiled successfully
✅ API rodando em http://seu-app.onrender.com:10000
📚 Swagger: http://seu-app.onrender.com:10000/api/docs
```

---

## Checklist de Deploy

- [ ] Render: Web Service criado
- [ ] Render: Variáveis de ambiente configuradas
- [ ] Supabase: Projeto criado
- [ ] Supabase: Network access habilitado
- [ ] GitHub: Conectado ao Render
- [ ] Git: Primeiro push feito (`git push origin main`)
- [ ] Build: Esperado e sucesso
- [ ] Swagger: Acessível em `/api/docs`
- [ ] Login: Funcionando com credenciais reais
- [ ] Database: Conectado e criando tabelas

---

## Variáveis Finais de Produção (.env no Render)

```env
# ===== CRITICAL =====
NODE_ENV=production
JWT_SECRET=sua_chave_super_secreta_aleatoria_here
DATABASE_SSL=true
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false

# ===== SUPABASE =====
DATABASE_HOST=db.xxxxx.supabase.co
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=SuaSenhaSupabase123
DATABASE_NAME=postgres

# ===== SERVER =====
PORT=10000

# ===== OPTIONAL =====
JWT_EXPIRATION=7d
REDIS_HOST=localhost  # Se usar Redis
SENTRY_DSN=your_sentry_dsn_here  # Se usar Sentry
```

---

## Após Deploy: Próximas Ações

1. **Frontend:** Deploy frontend que consome essa API
2. **Banco:** Criar usuários reais em produção
3. **Monitoramento:** Configurar Sentry ou logs
4. **Backup:** Configurar backups automáticos Supabase
5. **SSL:** Render inclui HTTPS gratuitamente ✅

---

## Performance em Produção

⚠️ **Render Free Tier:**
- Spins down após 15min inatividade (cold start)
- Leva ~30s para acordar
- Use Paid Tier para apps críticos

✅ **Otimizações:**
- Redis caching (5min TTL em Services)
- Database indexes (11 indexes em place)
- N+1 query fixes (relations carregadas)
- Connection pooling (50 max em prod)

---

## Próximos Passos

- Ler [Receita 00: Setup](./00_SETUP.md)
- Ler [Receita 09: Testes](./09_TESTES.md)
- Testar: `npm run test:e2e` antes de fazer push
- Deploy: `git push origin main`
- Celebrar! 🎉
