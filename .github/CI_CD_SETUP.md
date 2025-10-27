# CI/CD Setup Guide

Este documento explica como configurar e usar os workflows de CI/CD do projeto.

## 📋 Visão Geral

O projeto usa **GitHub Actions** para automação:

- **`ci.yml`**: Testes e validações (roda em todo PR e push)
- **`deploy.yml`**: Deploy automático (opcional, configurar quando necessário)

---

## 🔧 Configuração Inicial

### 1. GitHub Secrets

Para o CI/CD funcionar em produção, você precisa configurar secrets no GitHub:

**Acesse:** `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

#### Secrets necessários:

| Secret | Descrição | Onde encontrar |
|--------|-----------|----------------|
| `DATABASE_URL` | Connection string do Supabase (pooled) | Supabase Dashboard → Settings → Database → Connection Pooling |
| `DIRECT_URL` | Connection string do Supabase (direct) | Supabase Dashboard → Settings → Database → Connection String |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase | Supabase Dashboard → Settings → API → Project API keys → anon public |
| `NEXT_PUBLIC_PARTYKIT_HOST` | Host do PartyKit | Após deploy: `app-template-realtime.SEU-USERNAME.partykit.dev` |
| `PARTYKIT_TOKEN` | Token de autenticação do PartyKit | (Opcional) PartyKit Dashboard → Settings → API Tokens |

#### Como adicionar secrets:

```bash
# Exemplo dos valores (NÃO commitar!)
DATABASE_URL="postgresql://postgres.hsrminmgtvyggjgnwjch:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.hsrminmgtvyggjgnwjch:SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://hsrminmgtvyggjgnwjch.supabase.co"

NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

NEXT_PUBLIC_PARTYKIT_HOST="app-template-realtime.pedrohnas0.partykit.dev"
```

---

## 🚀 Workflows

### CI Workflow (`ci.yml`)

**Quando roda:**
- Todo push para `main`
- Todo Pull Request para `main`

**O que faz:**

1. **test-web** (app-web)
   - ✅ Linter (Biome)
   - ✅ Type check (TypeScript)
   - ✅ Testes unitários
   - ✅ Testes de integração
   - ✅ Coverage report

2. **test-realtime** (app-realtime)
   - ✅ Testes do PartyKit
   - ✅ Coverage report

3. **build-web**
   - ✅ Build do Next.js
   - ✅ Verifica se o projeto compila

4. **all-checks**
   - ✅ Verifica se todos os jobs passaram

**Status no PR:**
![CI Status](https://user-images.githubusercontent.com/example/ci-status.png)

---

### Deploy Workflow (`deploy.yml`)

**Quando roda:**
- Push para `main` (após CI passar)
- Trigger manual (workflow_dispatch)

**Status atual:** Configurado mas **desabilitado** (jobs com `if: false`)

**Para habilitar deploy automático:**

1. Configure os secrets (ver seção acima)
2. Edite `.github/workflows/deploy.yml`
3. Remova `if: false` dos jobs que deseja habilitar

**Deploy do PartyKit:**
```yaml
deploy-realtime:
  if: false  # ← Remover esta linha para habilitar
```

**Vercel:**
- Vercel já faz auto-deploy quando conectado ao GitHub
- Não precisa configurar workflow específico
- Veja: https://vercel.com/docs/git/vercel-for-github

---

## 🧪 Testando Localmente

### Validar antes de fazer push:

```bash
# No app-web
cd app-web
npm run check        # Linter
npm run typecheck    # TypeScript
npm run test:unit    # Testes unitários
npm run test:integration  # Testes de integração
npm run build        # Build

# No app-realtime
cd ../app-realtime/partykit
npm run test         # Testes do PartyKit
```

### Simular CI localmente com act:

```bash
# Instalar act (GitHub Actions local)
# macOS: brew install act
# Linux: https://github.com/nektos/act

# Rodar CI localmente
act pull_request

# Rodar job específico
act pull_request -j test-web
```

---

## 📊 Coverage Reports

### Codecov (Opcional)

Para visualizar cobertura de testes:

1. Acesse: https://codecov.io/
2. Conecte seu repositório GitHub
3. O CI vai enviar reports automaticamente

**Alternativa:** Ver coverage localmente:

```bash
cd app-web
npm run test:coverage
# Abrir: coverage/index.html

cd ../app-realtime/partykit
npm run test:coverage
# Abrir: coverage/index.html
```

---

## 🔍 Troubleshooting

### Build falhando no CI

**Erro:** `DATABASE_URL is not defined`

**Solução:** Configure os secrets no GitHub (ver seção "GitHub Secrets")

---

### Testes falhando localmente mas passando no CI

**Possível causa:** Cache de node_modules

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### PartyKit deploy falhando

**Erro:** `Unauthorized`

**Solução:**
```bash
cd app-realtime/partykit
npx partykit login
```

---

## 📝 Boas Práticas

### Antes de fazer merge:

1. ✅ CI verde (todos os checks passando)
2. ✅ Code review aprovado
3. ✅ Branch atualizada com main
4. ✅ Testes locais passando

### Commit messages:

```bash
# Formato: type(scope): message

feat(canvas): add collaborative cursors
fix(api): resolve database connection issue
test(hooks): add tests for usePartyKit
docs(readme): update setup instructions
chore(deps): update dependencies
```

---

## 🚦 Status Badges

Adicione ao README.md:

```markdown
![CI](https://github.com/pedrohnas0/app-template/workflows/CI/badge.svg)
![Deploy](https://github.com/pedrohnas0/app-template/workflows/Deploy/badge.svg)
```

---

## 🔄 Atualizações Futuras

Quando implementar novas features, volte aqui para:

- [ ] Adicionar testes E2E (Playwright) ao CI
- [ ] Habilitar deploy automático do PartyKit
- [ ] Configurar notificações (Slack/Discord)
- [ ] Adicionar performance testing
- [ ] Configurar Lighthouse CI
- [ ] Adicionar security scanning (Snyk, Dependabot)

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Codecov Docs](https://docs.codecov.com/)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [PartyKit Deploy Docs](https://docs.partykit.io/guides/deploying-your-partykit-server/)

---

**Última atualização:** 2025-10-27
**Status:** ✅ Configuração inicial completa
