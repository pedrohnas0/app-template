# App Template - Collaborative Canvas

Aplicação de canvas colaborativo em tempo real com Next.js 15, Supabase e PartyKit.

## 🏗️ Arquitetura do Monorepo

```
/
├── app-web/              # Next.js 15 (Frontend + API)
│   ├── src/
│   │   ├── app/         # Next.js App Router
│   │   ├── components/  # UI Components (Shadcn)
│   │   ├── server/      # tRPC API
│   │   └── lib/         # Utilities
│   ├── prisma/          # Database schema
│   └── package.json
│
├── app-realtime/         # Colaboração em tempo real
│   └── partykit/        # PartyKit server (Cloudflare)
│       ├── src/
│       │   └── canvas.ts
│       └── package.json
│
└── README.md            # Este arquivo
```

## 🎯 Serviços

### app-web
**Stack**: Next.js 15, React 19, TypeScript, tRPC, Prisma, Tailwind CSS

**Responsabilidades**:
- Interface do usuário
- Autenticação (futuro)
- API REST/tRPC
- Gestão de dados (PostgreSQL via Prisma)
- Deploy: Vercel

**Iniciar**:
```bash
cd app-web
npm install
npm run dev
```

Acesse: http://localhost:3000

---

### app-realtime
**Stack**: PartyKit, Cloudflare Workers, Durable Objects

**Responsabilidades**:
- WebSocket server para colaboração
- Broadcast de cursores em tempo real
- Gerenciamento de rooms (canvas)
- Deploy: Cloudflare (via PartyKit)

**Iniciar**:
```bash
cd app-realtime/partykit
npm install
npm run dev
```

Acesse: http://localhost:1999

---

## 🚀 Quick Start

### 1. Clone e instale dependências

```bash
# App Web
cd app-web
cp .env.example .env
npm install

# Setup do banco
npm run db:push

# Rodar dev server
npm run dev
```

### 2. (Opcional) Rodar serviço de colaboração

```bash
# Em outro terminal
cd app-realtime/partykit
npm install
npm run dev
```

### 3. Acessar

- **Web**: http://localhost:3000
- **Canvas**: http://localhost:3000/canvas
- **PartyKit**: http://localhost:1999

---

## 🗄️ Banco de Dados

### Desenvolvimento Local

O projeto usa PostgreSQL. Para iniciar:

```bash
cd app-web
./start-database.sh
```

Ou usar Docker:

```bash
docker run -d \
  --name app-template-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=app-template \
  -p 5432:5432 \
  postgres:16-alpine
```

### Supabase (Produção)

1. Criar projeto em https://supabase.com
2. Copiar DATABASE_URL
3. Atualizar `.env` em `app-web/`
4. Rodar migrations: `npm run db:migrate`

---

## 🧪 Testes

### app-web

```bash
cd app-web

# Unit tests (futuro)
npm run test

# E2E tests (futuro)
npm run test:e2e

# Type check
npm run typecheck

# Lint & Format
npm run check
```

---

## 📦 Deploy

### app-web (Vercel)

```bash
cd app-web
vercel
```

Ou conecte o repositório no dashboard da Vercel.

**Variáveis de ambiente necessárias**:
- `DATABASE_URL`: Connection string do Supabase
- `NEXT_PUBLIC_PARTYKIT_URL`: URL do PartyKit deploy

### app-realtime (PartyKit/Cloudflare)

```bash
cd app-realtime/partykit

# Login (primeira vez)
npx partykit login

# Deploy
npm run deploy
```

Recebe URL como: `https://app-template-realtime.username.partykit.dev`

---

## 🔧 Scripts Úteis

### app-web

```bash
npm run dev          # Desenvolvimento (Turbopack)
npm run build        # Build produção
npm run start        # Rodar build
npm run db:push      # Sync schema com DB
npm run db:studio    # Prisma Studio (GUI)
npm run check        # Lint + Format check
npm run check:write  # Auto-fix lint/format
npm run typecheck    # TypeScript validation
```

### app-realtime

```bash
npm run dev          # Dev server local
npm run deploy       # Deploy para Cloudflare
```

---

## 🛠️ Stack Técnica

### Frontend & API (app-web)
- **Framework**: Next.js 15 (App Router, RSC)
- **Linguagem**: TypeScript 5.8 (strict mode)
- **API**: tRPC 11 (type-safe RPC)
- **Database**: Prisma 6 + PostgreSQL
- **UI**: Shadcn/ui (52 componentes)
- **Styling**: Tailwind CSS v4
- **Canvas**: XYFlow (ReactFlow)
- **State**: React Query / TanStack Query
- **Validation**: Zod
- **Linting**: Biome

### Real-time (app-realtime)
- **Platform**: Cloudflare Workers + Durable Objects
- **Framework**: PartyKit
- **WebSocket**: Nativo
- **Language**: TypeScript

### DevOps
- **Hosting Web**: Vercel
- **Hosting Realtime**: Cloudflare
- **Database**: Supabase PostgreSQL
- **CI/CD**: Vercel (auto-deploy)

---

## 🗺️ Roadmap

### Fase 1: Fundação ✅
- [x] Setup Next.js 15 + T3 Stack
- [x] Componentes Shadcn UI
- [x] Canvas básico com XYFlow
- [x] Cursores mockados
- [x] Estrutura de monorepo

### Fase 2: Colaboração Real-time (Em progresso)
- [ ] Integração Supabase Realtime
- [ ] Cursores colaborativos reais
- [ ] Presence (usuários online)
- [ ] Integração PartyKit
- [ ] Sincronização de posição

### Fase 3: Features Avançadas
- [ ] Autenticação (NextAuth.js)
- [ ] Sincronização de formas (Yjs)
- [ ] Histórico/Undo-Redo
- [ ] Compartilhamento de canvas
- [ ] Permissões de usuário

### Fase 4: Testes & Qualidade
- [ ] Testes unitários (Vitest)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Monitoramento (Sentry?)

### Fase 5: Produção
- [ ] Otimizações de performance
- [ ] SEO
- [ ] Analytics
- [ ] Documentação completa

---

## 📚 Documentação

- [app-web/README.md](./app-web/README.md) - Setup e uso do Next.js
- [app-realtime/README.md](./app-realtime/README.md) - Setup e uso do PartyKit

---

## 🤝 Contribuindo

Este é um projeto de estudo/aprendizado. Sinta-se livre para explorar e experimentar!

---

## 📄 Licença

MIT

---

## 🔗 Links Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [PartyKit Docs](https://docs.partykit.io)
- [Shadcn UI](https://ui.shadcn.com)
- [XYFlow Docs](https://reactflow.dev)
