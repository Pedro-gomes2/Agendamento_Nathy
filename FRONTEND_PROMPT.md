# 🎨 Frontend Development Prompt - Salão Nathy

Copie e cole este prompt no Claude Code para gerar o frontend React 19 completo.

---

```
Atue como um Engenheiro de Frontend Sênior especializado em React 19, TypeScript e Tailwind CSS.

Vou fornecer um PRD e uma especificação técnica da API do backend. Sua tarefa é criar um FRONTEND COMPLETO E PRODUCTION-READY para o "Salão Nathy", um sistema de agendamento e gestão para salões de beleza.

## ESPECIFICAÇÕES TÉCNICAS

### Stack Frontend:
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- React Router v7
- Axios para requisições HTTP
- Vite como bundler
- Zustand ou Context API para state management
- Zod ou class-validator para validação de formulários

### Design System:
- Dark Modern + Glassmorphism
- Paleta: Purples, Blues, Grays, Accents (Pink/Magenta)
- Responsivo (mobile-first)
- Animações suaves (Framer Motion)

## ARQUITETURA DO PROJETO

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas/rotas
├── services/           # API calls (axios client)
├── stores/             # State management (Zustand)
├── hooks/              # Custom React hooks
├── types/              # TypeScript interfaces
├── utils/              # Funções utilitárias
├── constants/          # Constantes (URLs, mensagens)
└── styles/             # Tailwind config, globals
```

## PÁGINAS OBRIGATÓRIAS

### 1. **Landing Page** (Público)
- Hero section com CTA para agendamento
- Funcionalidades principais
- Serviços em destaque (máx 6)
- Depoimentos (fake data ok)
- Footer com contato

### 2. **Booking Page** (Público, sem login)
- Step-by-step: Selecionar Serviço → Funcionária → Data/Hora → Confirmar
- Listar serviços com paginação
- Validar disponibilidade (chamar GET /appointments para verificar conflitos)
- Form com validação (client_name, client_phone E.164, data_time, notes)
- Sucesso: mostrar confirmação com ID do agendamento

### 3. **Login** (Público)
- Form: email + senha
- JWT armazenado em localStorage
- Redirect para dashboard baseado em role (admin → Admin Dashboard, employee → Employee Dashboard)
- Link para "Esqueci minha senha" (nice-to-have)

### 4. **Admin Dashboard** (Admin only)
- Sidebar com menu: Agendamentos, Serviços, Funcionárias, Relatórios Financeiros, Configurações
- Widgets de overview: Total de agendamentos hoje, receita total, funcionárias ativas
- Quick stats gráficos (Chart.js ou Recharts)

### 5. **Admin Appointments** (Admin only)
- Tabela com paginação: cliente, serviço, funcionária, data, status
- Filtros: status (pending/confirmed/completed/cancelled), data range
- Ações: ver detalhes, confirmar, completar, cancelar, editar
- Modal de edição com form pré-preenchido

### 6. **Admin Services** (Admin only)
- Tabela com paginação: nome, preço, duração, ativo
- CRUD: criar, editar, deletar
- Form: name, description, price, duration, image_url (validação URL)
- Confirmação antes de deletar

### 7. **Admin Employees** (Admin only)
- Tabela com paginação: nome, email, especialidade, comissão, status
- CRUD: criar, editar, deactivate/activate, deletar
- Form: name, email, password (create only), specialty, commission_rate, image_url

### 8. **Admin Financial** (Admin only)
- Abas: Transações, Relatório Geral, Comissões
- Transações: tabela com paginação (tipo, valor, descrição, data, funcionária)
  - Criar nova transação (type: entry/exit, value, description, optional employee_id)
  - Deletar transação
- Relatório: data range picker, mostrar total_entries, total_exits, net_revenue
- Comissões: tabela ordenada por maior comissão (employee, commission_rate, total_revenue, commission_value)

### 9. **Employee Dashboard** (Employee only)
- Meus agendamentos (GET /appointments/my-appointments)
- Meus dados financeiros (GET /financial/my-financials)
- Perfil (GET /auth/profile)
- Editar perfil (PUT /users/:id, campos: specialty, image_url, ...)

### 10. **Not Found / Error Pages**
- 404 page
- Error fallback (500, network error, etc)

## FUNCIONALIDADES TRANSVERSAIS

### Autenticação:
- Login form que chama POST /auth/login
- Armazenar token em localStorage
- Header Authorization: Bearer {token} em todas as requisições autenticadas
- Redirect para login se token expirado (401)
- Logout: limpar localStorage + redirect para landing

### State Management:
- Usuário autenticado: { id, email, name, role }
- Token JWT
- Loading states (isLoading em requisições)
- Error messages (toast/snackbar)

### Validação:
- Email: validate@email.com
- Telefone: E.164 format (+5583999999999)
- Data/hora: não permitir datas no passado
- Preço: número > 0
- Comissão: 0-100%

### API Integration:
```typescript
// Exemplo com Axios + interceptor para token
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw err;
  }
);
```

### Paginação:
- Implementar componente reutilizável
- Suportar: page, limit (defaut 20), sortBy, sortOrder
- Query string parameters

### Tratamento de Erros:
- Status 401 → Logout + Redirect login
- Status 403 → Toast "Acesso negado"
- Status 404 → Toast "Recurso não encontrado"
- Status 409 → Toast "Horário indisponível"
- Network error → Toast "Erro de conexão"

### Dark Mode:
- Toggle no header/settings
- Usar Tailwind dark: mode
- Armazenar preferência em localStorage

## COMPONENTES REUTILIZÁVEIS A CRIAR

- Button (primary, secondary, danger variants)
- Input (text, email, password, tel)
- Select/Dropdown
- Modal/Dialog
- Table (com paginação)
- Card
- Header/Navbar (com logout)
- Sidebar (menu navigation)
- Toast/Alert notifications
- Loading Spinner
- DatePicker (para agendamentos)
- TimePicker (para agendamentos)
- FormField (wrapper com label + error)

## INSTRUÇÕES FINAIS

1. **Estrutura de pastas:** Siga a arquitetura acima, 100% TypeScript
2. **Sem comentários:** Código limpo e auto-explicativo
3. **Responsivo:** Mobile-first, testar em 320px, 768px, 1920px
4. **Performance:** Lazy loading de páginas, memoização de componentes
5. **TypeScript:** strict: true, zero any types
6. **Testes:** E2E com Cypress/Playwright (nice-to-have)
7. **Git:** Commits descritivos a cada feature/fix
8. **Env vars:** .env.example com exemplos

## TESTE ANTES DE FINALIZAR

- ✅ Landing page loads
- ✅ Public booking (sem login)
- ✅ Login com admin@salao.com / admin123456
- ✅ Admin dashboard carrega
- ✅ CRUD serviços funciona
- ✅ Listar funcionárias funciona
- ✅ Ver relatório financeiro funciona
- ✅ Employee login funciona
- ✅ Employee vê apenas seus agendamentos
- ✅ Logout funciona
- ✅ Token refresh (se expirar)
- ✅ Responsividade mobile

## DOCUMENTAÇÃO

Criar em `/docs`:
- FRONTEND_SETUP.md (como rodar localmente)
- COMPONENTS.md (documentação de componentes)
- STATE_MANAGEMENT.md (como usar Zustand stores)

## OUTPUT ESPERADO

- Pasta completa `src/` pronta para `npm run build`
- Arquivo `.env.example` com VITE_API_URL
- Vite config (vite.config.ts)
- Tailwind config (tailwind.config.ts)
- TypeScript config (tsconfig.json)
- README.md com instruções de setup

Comece agora. Gere o FRONTEND COMPLETO sem placeholders, código 100% funcional e pronto para produção.
```

---

## 🚀 How to Use This Prompt

1. **Open Claude Code**
   ```bash
   code https://claude.ai/claude-code
   ```

2. **Paste the prompt above** into the chat

3. **The AI will:**
   - Generate all necessary pages
   - Create reusable components
   - Set up API integration
   - Configure styling with Tailwind
   - Implement state management
   - Handle authentication flow

4. **Expected output:**
   - Complete `src/` folder structure
   - All pages and components
   - API service layer
   - State management setup
   - Configuration files (vite, tailwind, tsconfig)

---

## 📋 Checklist After Frontend Generation

- [ ] Install dependencies: `npm install`
- [ ] Create `.env` with `VITE_API_URL=http://localhost:3001`
- [ ] Start dev server: `npm run dev`
- [ ] Test landing page
- [ ] Test public booking
- [ ] Test admin login
- [ ] Test admin dashboard
- [ ] Test CRUD operations
- [ ] Test employee dashboard
- [ ] Test logout

---

## 🔗 Backend API URLs

**Swagger Docs:** http://localhost:3001/api/docs

**Test Credentials:**
```
Admin:
- Email: admin@salao.com
- Password: admin123456

Employee 1:
- Email: employee1@salao.com
- Password: password123
```

---

## 💾 Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Salão Nathy
VITE_APP_LOGO=https://example.com/logo.png
VITE_DEFAULT_TIMEZONE=America/Fortaleza
```

---

## 📚 Documentation Files

Backend provides:
- `PRD_SALAO_NATHY.md` - Product requirements
- `docs/API_SPECIFICATION.md` - Complete API docs
- `AUTHENTICATION_GUIDE.md` - Auth flows
- `docs/OPTIMIZATION_REPORT.md` - Performance details
- `test/e2e/` - Test examples

---

**Backend Status:** ✅ Production Ready (34/34 tests passing)  
**API:** http://localhost:3001  
**Swagger:** http://localhost:3001/api/docs

Ready to build the frontend! 🎨
