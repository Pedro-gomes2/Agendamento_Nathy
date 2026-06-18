# 🔐 Guia de Autenticação - Salão Nathy API

## Credenciais Padrão (ADMIN)

```
Email: admin@salao.com
Senha: admin123456
```

## Token JWT Válido (Válido por 7 dias)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMGE1MDkwMC05MzFjLTQ4MTYtODcxZC1jNTY2YTkyMWEzZWIiLCJlbWFpbCI6ImFkbWluQHNhbGFvLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc5MjkyMSwiZXhwIjoxNzgyMzk3NzIxfQ.AOSFZ3nyEiUWBOPLr5tOQziCK9btggrVZCZ2Oi3kGdA
```

---

## 📌 Como Usar o Token

### Opção 1: Via Swagger UI (RECOMENDADO)

1. Abra: **http://localhost:3001/api/docs**
2. Clique no botão **🔓 Authorize** (cadeado no canto superior direito)
3. No campo **value**, cole o token:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMGE1MDkwMC05MzFjLTQ4MTYtODcxZC1jNTY2YTkyMWEzZWIiLCJlbWFpbCI6ImFkbWluQHNhbGFvLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc5MjkyMSwiZXhwIjoxNzgyMzk3NzIxfQ.AOSFZ3nyEiUWBOPLr5tOQziCK9btggrVZCZ2Oi3kGdA
   ```
4. Clique em **Authorize**
5. Agora todos os endpoints terão o token automaticamente

### Opção 2: Via cURL (Terminal)

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMGE1MDkwMC05MzFjLTQ4MTYtODcxZC1jNTY2YTkyMWEzZWIiLCJlbWFpbCI6ImFkbWluQHNhbGFvLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc5MjkyMSwiZXhwIjoxNzgyMzk3NzIxfQ.AOSFZ3nyEiUWBOPLr5tOQziCK9btggrVZCZ2Oi3kGdA" \
  http://localhost:3001/users
```

### Opção 3: Via Postman

1. Na request, vá em **Headers**
2. Adicione uma nova header:
   - **Key**: `Authorization`
   - **Value**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ✅ Endpoints para Testar

### 1️⃣ Listar Usuários (Admin only)
```bash
GET /users
Authorization: Bearer <seu-token>
```
**Resposta esperada**: Lista de usuários

### 2️⃣ Obter Perfil do Usuário Logado
```bash
GET /users/profile
Authorization: Bearer <seu-token>
```
**Resposta esperada**: Dados do admin

### 3️⃣ Registrar Nova Funcionária (Admin only)
```bash
POST /auth/register-employee
Authorization: Bearer <seu-token>

Body (JSON):
{
  "name": "Maria Silva",
  "email": "maria@salao.com",
  "password": "senha123456",
  "specialty": "Manicure",
  "commission_rate": 25,
  "photo_url": "https://exemplo.com/maria.jpg"
}
```

### 4️⃣ Listar Serviços (Público - sem token)
```bash
GET /services
```

### 5️⃣ Criar Serviço (Admin only)
```bash
POST /services
Authorization: Bearer <seu-token>

Body (JSON):
{
  "name": "Corte + Hidratação",
  "description": "Corte profissional com hidratação profunda",
  "price": 150.00,
  "duration": 90
}
```

### 6️⃣ Criar Agendamento (Público)
```bash
POST /appointments
Body (JSON):
{
  "client_name": "João Silva",
  "client_phone": "+5583999999999",
  "date_time": "2025-06-25T14:30:00Z",
  "employee_id": "<uuid-da-funcionária>",
  "service_id": "<uuid-do-serviço>",
  "notes": "Cliente vip"
}
```

---

## 🔑 Informações do Token Decodificado

```json
{
  "sub": "00a50900-931c-4816-871d-c566a921a3eb",
  "email": "admin@salao.com",
  "role": "admin",
  "iat": 1781792921,
  "exp": 1782397721
}
```

- **sub**: ID do usuário
- **email**: E-mail do admin
- **role**: Tipo de acesso (`admin` ou `employee`)
- **iat**: Token emitido em
- **exp**: Token expira em

---

## 🚀 API Status

- Backend: ✅ Rodando em `http://localhost:3001`
- Swagger: ✅ Disponível em `http://localhost:3001/api/docs`
- Banco de dados: ✅ Conectado ao Neon PostgreSQL

---

## 📝 Próximos Passos

1. **Teste os endpoints** via Swagger com o token acima
2. **Crie uma funcionária** usando o endpoint `/auth/register-employee`
3. **Crie serviços** usando o endpoint `/services` (POST)
4. **Crie agendamentos** públicos usando `/appointments` (sem token)
5. **Comece o frontend** React quando o backend estiver validado
