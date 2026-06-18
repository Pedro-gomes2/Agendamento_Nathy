# Contribuindo para Salão Nathy Backend

Obrigado por considerar contribuir! Por favor, siga as diretrizes abaixo.

## Padrões de Código

### TypeScript
- Use `strict: true` no tsconfig.json
- Sempre adicione tipos (sem `any`)
- Use interfaces para contracts

### NestJS
- Use decorators para metadados
- Implemente Guards para controle de acesso
- Use Pipes para validação

### Exemplo de Controlador

```typescript
@Controller('resources')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ResourceController {
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Descrição' })
  async create(@Body() dto: CreateResourceDto) {
    return this.service.create(dto);
  }
}
```

## Commits

Siga o padrão de commits:

```
feat: adicionar nova feature
fix: corrigir bug
docs: atualizar documentação
style: formatação de código
refactor: refatoração sem mudança de behavior
test: adicionar/atualizar testes
chore: tarefas de build/dependências
```

## Pull Requests

1. Crie uma branch feature: `git checkout -b feature/my-feature`
2. Faça commits atômicos
3. Push para a branch: `git push origin feature/my-feature`
4. Abra um Pull Request com descrição clara

## Testes

```bash
# Rodar todos os testes
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Lint

```bash
npm run lint
```

Todos os arquivos devem passar no lint antes de fazer push.

---

Obrigado! 🎉
