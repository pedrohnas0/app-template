# Plan 01 - Implementação Colaborativa com TDD

**Objetivo:** Implementar canvas colaborativo em tempo real com PartyKit/Cloudflare + Supabase, usando TDD desde o início.

**Duração Estimada:** 14-18 dias

**Última Atualização:** 2025-10-27

---

## 📐 Arquitetura Final

```
┌─────────────────────────────────────────────┐
│  app-web (Next.js 15)                       │
│  - UI/UX                                    │
│  - tRPC API                                 │
│  - PartyKit Client                          │
│  - Supabase Client                          │
│                                             │
│  Deploy: Vercel (serverless)                │
│  Testes: Vitest + Testing Library + PW     │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌─────────────────────────┐
│  Supabase    │  │  app-realtime           │
│  PostgreSQL  │  │  (PartyKit)             │
│              │  │                         │
│  - Posts     │  │  - Canvas Party         │
│  - Shapes    │  │  - WebSocket server     │
│  - Users     │  │  - CRDT (Yjs)           │
│              │  │                         │
│  Deploy:     │  │  Deploy: Cloudflare     │
│  Managed     │  │  Testes: Vitest + WS    │
└──────────────┘  └─────────────────────────┘
```

---

## 🎯 Decisões Arquiteturais

### **Por que NÃO usar Supabase Realtime?**

**Usaremos:**
- ✅ **Supabase Postgres** - Banco de dados gerenciado
- ✅ **Supabase Auth** - Autenticação (fase futura)
- ❌ **Supabase Realtime** - NÃO (usaremos PartyKit)

**Motivos:**
1. PartyKit tem CRDT (Yjs) nativo → melhor para formas
2. Latência menor (edge da Cloudflare)
3. Controle total do WebSocket
4. Separação de responsabilidades clara

### **Divisão de Responsabilidades**

| Componente | Responsabilidade | Tecnologia |
|------------|------------------|------------|
| **app-web** | UI, API REST/RPC, Validação | Next.js 15, tRPC, Zod |
| **app-realtime** | WebSocket, CRDT, Sync | PartyKit, Yjs, Cloudflare |
| **Supabase** | Persistência, Auth | PostgreSQL, Supabase Auth |

---

## 🧪 Estratégia de TDD

### **Pirâmide de Testes**

```
        ┌────────────┐
        │    E2E     │  10% - Playwright
        │  (10 tests)│
        └────────────┘
       ┌──────────────┐
       │ Integration  │  30% - Testing Library + MSW
       │  (30 tests)  │
       └──────────────┘
      ┌────────────────┐
      │     Unit       │  60% - Vitest
      │  (60 tests)    │
      └────────────────┘
```

### **Cobertura de Testes por Camada**

#### **1. app-web (Frontend)**

**Unit Tests (Vitest)**
- ✅ Hooks (use-realtime-canvas.ts, use-partykit.ts)
- ✅ Utils (cn, formatters, validators)
- ✅ Components isolados (Cursor, CursorBody, etc)
- ✅ tRPC client helpers

**Integration Tests (Testing Library + MSW)**
- ✅ Componentes com API (mock tRPC)
- ✅ Fluxos de usuário (adicionar forma, mover, etc)
- ✅ Canvas interações
- ✅ WebSocket mock

**E2E Tests (Playwright)**
- ✅ Colaboração multi-usuário
- ✅ Persistência (salvar/carregar canvas)
- ✅ Fluxos completos

#### **2. app-web (Backend - tRPC)**

**Unit Tests (Vitest)**
- ✅ Validators (Zod schemas)
- ✅ Procedures isolados
- ✅ Database helpers

**Integration Tests (Vitest + Test DB)**
- ✅ Routers completos
- ✅ CRUD operations
- ✅ Context/Auth

#### **3. app-realtime (PartyKit)**

**Unit Tests (Vitest)**
- ✅ Message handlers
- ✅ CRDT operations
- ✅ Validation logic

**Integration Tests (Vitest + WebSocket Mock)**
- ✅ Multi-client scenarios
- ✅ Message broadcasting
- ✅ State synchronization

**E2E Tests (Custom)**
- ✅ Real WebSocket connections
- ✅ Multiple parties
- ✅ CRDT conflict resolution

---

## 📦 Stack Tecnológica Completa

### **app-web**

#### **Produção**
```json
{
  "next": "^15.2.3",
  "react": "^19.0.0",
  "@trpc/server": "^11.0.0",
  "@trpc/client": "^11.0.0",
  "@trpc/react-query": "^11.0.0",
  "@tanstack/react-query": "^5.69.0",
  "prisma": "^6.5.0",
  "@prisma/client": "^6.5.0",
  "partysocket": "^1.0.2",
  "yjs": "^13.6.18",
  "y-partykit": "^0.0.23",
  "@xyflow/react": "^12.9.0",
  "zod": "^3.25.76",
  "@supabase/supabase-js": "^2.45.0"
}
```

#### **Testes**
```json
{
  "vitest": "^2.1.0",
  "@vitest/ui": "^2.1.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.5.0",
  "@testing-library/user-event": "^14.5.2",
  "msw": "^2.6.0",
  "playwright": "^1.48.0",
  "@playwright/test": "^1.48.0"
}
```

### **app-realtime**

#### **Produção**
```json
{
  "partykit": "^0.0.111",
  "y-partykit": "^0.0.23",
  "yjs": "^13.6.18"
}
```

#### **Testes**
```json
{
  "vitest": "^2.1.0",
  "@cloudflare/workers-types": "^4.20241011.0",
  "ws": "^8.18.0"
}
```

---

## 🗂️ Estrutura de Arquivos Final

```
app-template/
├── plans/
│   ├── plan-01.md              # Este arquivo
│   └── implementations/        # Registros de implementação
│
├── app-web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── canvas/
│   │   │   │   └── page.tsx
│   │   │   └── api/
│   │   │       └── trpc/[trpc]/route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                      # Shadcn
│   │   │   ├── kibo-ui/                 # Custom
│   │   │   └── canvas/                  # Canvas específico
│   │   │       ├── canvas-root.tsx
│   │   │       ├── collaborative-cursors.tsx
│   │   │       ├── shape-renderer.tsx
│   │   │       └── canvas-controls.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-partykit.ts
│   │   │   ├── use-collaborative-canvas.ts
│   │   │   └── use-yjs-shapes.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   └── server.ts
│   │   │   ├── partykit/
│   │   │   │   ├── client.ts
│   │   │   │   └── types.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── server/
│   │       ├── api/
│   │       │   ├── routers/
│   │       │   │   ├── canvas.ts        # CRUD de canvas
│   │       │   │   ├── shape.ts         # CRUD de shapes
│   │       │   │   └── post.ts          # Já existe
│   │       │   ├── root.ts
│   │       │   └── trpc.ts
│   │       └── db.ts
│   │
│   ├── tests/                           # ← NOVA ESTRUTURA
│   │   ├── unit/                        # Testes unitários (sempre mockado)
│   │   │   ├── lib/
│   │   │   │   ├── utils.test.ts
│   │   │   │   └── partykit/
│   │   │   │       └── client.test.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-partykit.test.ts
│   │   │   │   └── use-yjs-shapes.test.ts
│   │   │   ├── components/
│   │   │   │   ├── cursor.test.tsx
│   │   │   │   └── canvas-controls.test.tsx
│   │   │   └── server/
│   │   │       └── api/
│   │   │           └── routers/
│   │   │               ├── canvas.test.ts
│   │   │               └── shape.test.ts
│   │   │
│   │   ├── integration/                 # Testes de integração (parcialmente mockado)
│   │   │   ├── api/
│   │   │   │   ├── canvas-crud.test.ts
│   │   │   │   └── shape-crud.test.ts
│   │   │   ├── components/
│   │   │   │   ├── canvas-root.test.tsx
│   │   │   │   └── collaborative-cursors.test.tsx
│   │   │   └── hooks/
│   │   │       └── use-collaborative-canvas.test.ts
│   │   │
│   │   ├── e2e/                         # Testes end-to-end (sem mocks)
│   │   │   ├── canvas.spec.ts
│   │   │   ├── collaboration.spec.ts
│   │   │   └── shapes.spec.ts
│   │   │
│   │   └── helpers/                     # Test utilities
│   │       ├── setup.ts                 # Vitest setup
│   │       ├── render.tsx               # Render helpers
│   │       ├── trpc-caller.ts           # tRPC test caller
│   │       └── mocks/
│   │           ├── handlers.ts          # MSW handlers
│   │           └── server.ts            # MSW server
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── .env.example
│   └── package.json
│
└── app-realtime/
    └── partykit/
        ├── src/
        │   ├── __tests__/
        │   │   ├── canvas.test.ts
        │   │   └── yjs-sync.test.ts
        │   ├── canvas.ts
        │   └── utils/
        │       └── yjs-helpers.ts
        ├── vitest.config.ts
        └── package.json
```

---

## 🔧 Variáveis de Ambiente

### **app-web/.env.example**
```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."

# PartyKit
NEXT_PUBLIC_PARTYKIT_HOST="app-template-realtime.USERNAME.partykit.dev"

# Node
NODE_ENV="development"
```

### **app-realtime/partykit/.env.example**
```bash
# Supabase (para salvar estado)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Node
NODE_ENV="development"
```

---

## 📊 Schema do Banco (Prisma)

### **Novo Schema Completo**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Já existe
model Post {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
}

// Novo - Canvas
model Canvas {
  id          String   @id @default(cuid())
  name        String
  description String?
  thumbnail   String?  // URL da thumbnail

  // Metadados
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?  // User ID (futuro)

  // Relacionamentos
  shapes      Shape[]

  @@index([createdAt])
  @@index([createdBy])
}

// Novo - Formas no Canvas
model Shape {
  id       String @id @default(cuid())
  canvasId String

  // Tipo e dados da forma
  type     String // "rect", "circle", "text", "line"
  data     Json   // Dados específicos da forma

  // Posição e estilo
  x        Float
  y        Float
  width    Float?
  height   Float?
  rotation Float  @default(0)

  // Estilo
  fill      String? // Cor de preenchimento
  stroke    String? // Cor da borda
  opacity   Float   @default(1)

  // Ordem (z-index)
  zIndex   Int     @default(0)

  // Metadados
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?  // User ID

  // Relacionamentos
  canvas   Canvas @relation(fields: [canvasId], references: [id], onDelete: Cascade)

  @@index([canvasId])
  @@index([type])
  @@index([zIndex])
}

// Futuro - Users (quando adicionar auth)
// model User {
//   id        String   @id @default(cuid())
//   email     String   @unique
//   name      String?
//   avatar    String?
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }
```

---

## 🚀 Fases de Implementação

### **FASE 0: Setup e Infraestrutura** (2-3 dias)

#### **0.1 - Migração para Supabase**
**Objetivo:** Sair do Postgres local, ir para Supabase

**Tarefas:**
1. Criar projeto no Supabase
2. Copiar connection strings
3. Atualizar `.env` com Supabase URLs
4. Instalar `@supabase/supabase-js`
5. Criar `src/lib/supabase/client.ts`
6. Criar `src/lib/supabase/server.ts`
7. Testar conexão

**Entregável:**
- ✅ app-web conectado ao Supabase Postgres
- ✅ Migrations rodando
- ✅ Supabase client configurado

---

#### **0.2 - Setup de Testes (app-web)**
**Objetivo:** Infraestrutura de TDD no Next.js com estrutura organizada

**Tarefas:**
1. Instalar dependências de teste (Vitest, Testing Library, Playwright, MSW)
2. Criar estrutura `tests/` com subpastas `unit/`, `integration/`, `e2e/`, `helpers/`
3. Configurar Vitest (`vitest.config.ts`)
4. Configurar Testing Library (`tests/helpers/setup.ts`)
5. Configurar MSW (`tests/helpers/mocks/`)
6. Criar helpers de teste (`tests/helpers/render.tsx`, `trpc-caller.ts`)
7. Configurar Playwright (`playwright.config.ts`)
8. Criar primeiro teste unitário (sanity check)
9. Configurar scripts no `package.json`

**Entregável:**
- ✅ `npm run test:unit` funciona
- ✅ `npm run test:integration` funciona
- ✅ `npm run test:e2e` funciona
- ✅ `npm run test` roda todos
- ✅ Coverage report configurado

**Scripts no package.json:**
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:watch": "vitest watch tests/unit",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Exemplo de teste inicial:**
```typescript
// tests/unit/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '~/lib/utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active')
  })
})
```

---

#### **0.3 - Setup de Testes (app-realtime)**
**Objetivo:** TDD no PartyKit

**Tarefas:**
1. Instalar Vitest no app-realtime
2. Configurar para Workers/Cloudflare types
3. Criar mocks de WebSocket
4. Primeiro teste do Party

**Entregável:**
- ✅ Testes unitários do PartyKit rodando

---

#### **0.4 - CI/CD com GitHub Actions**
**Objetivo:** Automação de testes e deploy

**Criar `.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Testes do app-web
  test-web:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app-web/package-lock.json

      - name: Install dependencies
        working-directory: ./app-web
        run: npm ci

      - name: Run linter
        working-directory: ./app-web
        run: npm run check

      - name: Run type check
        working-directory: ./app-web
        run: npm run typecheck

      - name: Run unit tests
        working-directory: ./app-web
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./app-web/coverage/coverage-final.json

  # Job 2: Testes E2E
  test-e2e:
    runs-on: ubuntu-latest
    needs: test-web

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./app-web
        run: npm ci

      - name: Install Playwright
        working-directory: ./app-web
        run: npx playwright install --with-deps

      - name: Run E2E tests
        working-directory: ./app-web
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: app-web/playwright-report/

  # Job 3: Testes do app-realtime
  test-realtime:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./app-realtime/partykit
        run: npm ci

      - name: Run tests
        working-directory: ./app-realtime/partykit
        run: npm run test

  # Job 4: Build
  build:
    runs-on: ubuntu-latest
    needs: [test-web, test-realtime]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./app-web
        run: npm ci

      - name: Build
        working-directory: ./app-web
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

**Criar `.github/workflows/deploy.yml`:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Vercel auto-deploys, mas podemos adicionar checks
      - name: Wait for Vercel deployment
        run: echo "Vercel auto-deploys on push to main"

  deploy-realtime:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./app-realtime/partykit
        run: npm ci

      - name: Deploy to PartyKit
        working-directory: ./app-realtime/partykit
        run: npx partykit deploy
        env:
          PARTYKIT_TOKEN: ${{ secrets.PARTYKIT_TOKEN }}
```

**Secrets necessários no GitHub:**
- `DATABASE_URL`
- `TEST_DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PARTYKIT_TOKEN`

**Entregável:**
- ✅ CI roda em cada PR
- ✅ Deploy automático no merge para main
- ✅ Coverage report no PR

---

### **FASE 1: Database e API (app-web)** (3-4 dias)

#### **1.1 - Atualizar Schema Prisma**
**TDD:** Escrever testes antes de implementar

**1. Escrever testes (RED):**
```typescript
// src/server/api/routers/__tests__/canvas.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createCaller } from '../../../test/trpc-caller'
import { db } from '~/server/db'

describe('canvas router', () => {
  beforeEach(async () => {
    // Limpar DB de teste
    await db.canvas.deleteMany()
  })

  describe('create', () => {
    it('should create a new canvas', async () => {
      const caller = createCaller()

      const canvas = await caller.canvas.create({
        name: 'Test Canvas',
        description: 'A test canvas',
      })

      expect(canvas).toMatchObject({
        id: expect.any(String),
        name: 'Test Canvas',
        description: 'A test canvas',
      })
    })

    it('should reject invalid input', async () => {
      const caller = createCaller()

      await expect(
        caller.canvas.create({ name: '' })
      ).rejects.toThrow()
    })
  })

  describe('getById', () => {
    it('should return canvas with shapes', async () => {
      // Setup: criar canvas e shapes
      const canvas = await db.canvas.create({
        data: {
          name: 'Test',
          shapes: {
            create: [
              { type: 'rect', data: {}, x: 0, y: 0 }
            ]
          }
        },
        include: { shapes: true }
      })

      // Test
      const caller = createCaller()
      const result = await caller.canvas.getById({ id: canvas.id })

      expect(result.shapes).toHaveLength(1)
      expect(result.shapes[0]).toMatchObject({
        type: 'rect',
        x: 0,
        y: 0,
      })
    })
  })
})
```

**2. Implementar (GREEN):**
```typescript
// src/server/api/routers/canvas.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const canvasRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.canvas.create({
        data: input,
      })
    }),

  getById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.canvas.findUniqueOrThrow({
        where: { id: input.id },
        include: { shapes: true },
      })
    }),

  list: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.canvas.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 50,
      })
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.canvas.delete({
        where: { id: input.id },
      })
    }),
})
```

**3. Refatorar (REFACTOR):**
- Extrair validators para arquivo separado
- Adicionar error handling
- Melhorar tipos

**Tarefas:**
1. ✅ Atualizar `schema.prisma` (adicionar Canvas + Shape)
2. ✅ Escrever testes do router `canvas.ts` (TDD)
3. ✅ Implementar router `canvas.ts`
4. ✅ Escrever testes do router `shape.ts` (TDD)
5. ✅ Implementar router `shape.ts`
6. ✅ Rodar migrations
7. ✅ Testes passando

**Entregável:**
- ✅ API tRPC para Canvas CRUD
- ✅ API tRPC para Shape CRUD
- ✅ Testes com 100% coverage

---

### **FASE 2: PartyKit Server** (3-4 dias)

#### **2.1 - Party Base com TDD**

**1. Escrever testes (RED):**
```typescript
// app-realtime/partykit/src/__tests__/canvas.test.ts
import { describe, it, expect, vi } from 'vitest'
import CanvasParty from '../canvas'

describe('CanvasParty', () => {
  describe('onConnect', () => {
    it('should send sync message to new connection', () => {
      const mockRoom = {
        id: 'test-room',
        getConnections: vi.fn(() => []),
        broadcast: vi.fn(),
      }

      const mockConn = {
        id: 'user-1',
        send: vi.fn(),
      }

      const party = new CanvasParty(mockRoom as any)
      party.onConnect(mockConn as any, {} as any)

      expect(mockConn.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"sync"')
      )
    })
  })

  describe('onMessage', () => {
    it('should broadcast cursor updates', () => {
      const mockRoom = {
        id: 'test-room',
        broadcast: vi.fn(),
      }

      const mockConn = { id: 'user-1' }

      const party = new CanvasParty(mockRoom as any)

      const message = JSON.stringify({
        type: 'cursor',
        x: 100,
        y: 200,
      })

      party.onMessage(message, mockConn as any)

      expect(mockRoom.broadcast).toHaveBeenCalledWith(
        message,
        ['user-1']
      )
    })
  })
})
```

**2. Implementar (GREEN):**
- Já criamos o `canvas.ts` básico
- Ajustar para passar nos testes

**3. Refatorar:**
- Extrair types
- Adicionar validation

**Entregável:**
- ✅ CanvasParty com testes
- ✅ WebSocket funcionando
- ✅ Broadcast de mensagens

---

#### **2.2 - Integrar Yjs**

**1. Escrever testes:**
```typescript
// app-realtime/partykit/src/__tests__/yjs-sync.test.ts
import { describe, it, expect } from 'vitest'
import * as Y from 'yjs'

describe('Yjs Synchronization', () => {
  it('should sync arrays between two documents', () => {
    const doc1 = new Y.Doc()
    const doc2 = new Y.Doc()

    const shapes1 = doc1.getArray('shapes')
    const shapes2 = doc2.getArray('shapes')

    // Add shape to doc1
    shapes1.push([{ type: 'rect', x: 0, y: 0 }])

    // Sync
    const update = Y.encodeStateAsUpdate(doc1)
    Y.applyUpdate(doc2, update)

    // Check doc2 received update
    expect(shapes2.length).toBe(1)
    expect(shapes2.get(0)).toMatchObject({ type: 'rect' })
  })
})
```

**2. Implementar:**
```typescript
// app-realtime/partykit/src/canvas.ts (atualizado)
import type * as Party from "partykit/server";
import * as Y from "yjs";

export default class CanvasParty implements Party.Server {
  // Yjs document (shared state)
  doc: Y.Doc;

  constructor(readonly room: Party.Room) {
    this.doc = new Y.Doc();
  }

  async onConnect(conn: Party.Connection) {
    // Enviar estado atual do Yjs
    const state = Y.encodeStateAsUpdate(this.doc);
    conn.send(state);
  }

  onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    if (message instanceof ArrayBuffer) {
      // É um update do Yjs
      Y.applyUpdate(this.doc, new Uint8Array(message));

      // Broadcast para outros
      this.room.broadcast(message, [sender.id]);
    } else {
      // Mensagem normal (cursor, etc)
      this.room.broadcast(message, [sender.id]);
    }
  }
}
```

**Tarefas:**
1. ✅ Instalar `yjs` e `y-partykit`
2. ✅ Escrever testes de sync
3. ✅ Implementar Yjs no Party
4. ✅ Testar com múltiplos clientes

**Entregável:**
- ✅ CRDT funcionando
- ✅ Sincronização automática
- ✅ Testes de conflito passando

---

### **FASE 3: Frontend - Canvas Colaborativo** (4-5 dias) ✅ CONCLUÍDA

#### **3.1 - Hook usePartyKit com TDD** ✅

**1. Escrever testes:**
```typescript
// src/hooks/__tests__/use-partykit.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { usePartyKit } from '../use-partykit'

// Mock PartySocket
vi.mock('partysocket', () => ({
  default: vi.fn(() => ({
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    close: vi.fn(),
  })),
}))

describe('usePartyKit', () => {
  it('should connect to party', async () => {
    const { result } = renderHook(() =>
      usePartyKit({ room: 'test-room' })
    )

    await waitFor(() => {
      expect(result.current.socket).toBeDefined()
    })
  })

  it('should handle messages', async () => {
    const onMessage = vi.fn()

    const { result } = renderHook(() =>
      usePartyKit({ room: 'test', onMessage })
    )

    // Simular mensagem
    const mockEvent = new MessageEvent('message', {
      data: JSON.stringify({ type: 'test' })
    })

    // ... testar que onMessage foi chamado
  })
})
```

**2. Implementar:**
```typescript
// src/hooks/use-partykit.ts
import { useEffect, useRef, useState } from 'react'
import PartySocket from 'partysocket'

type UsePartyKitOptions = {
  room: string
  onMessage?: (data: any) => void
}

export function usePartyKit({ room, onMessage }: UsePartyKitOptions) {
  const [socket, setSocket] = useState<PartySocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const partySocket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room,
    })

    partySocket.addEventListener('open', () => {
      setIsConnected(true)
    })

    partySocket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      onMessage?.(data)
    })

    partySocket.addEventListener('close', () => {
      setIsConnected(false)
    })

    setSocket(partySocket)

    return () => {
      partySocket.close()
    }
  }, [room])

  const send = (data: any) => {
    socket?.send(JSON.stringify(data))
  }

  return { socket, isConnected, send }
}
```

**Tarefas:**
1. ✅ Escrever testes do hook
2. ✅ Implementar hook
3. ✅ Testar conexão real (manual)

---

#### **3.2 - Hook useYjsShapes com TDD** ✅

**Similar ao anterior, mas para Yjs:**

```typescript
// src/hooks/use-yjs-shapes.ts
import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { usePartyKit } from './use-partykit'

type Shape = {
  id: string
  type: 'rect' | 'circle' | 'text'
  x: number
  y: number
  // ... outros campos
}

export function useYjsShapes(room: string) {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [doc] = useState(() => new Y.Doc())
  const shapesArray = doc.getArray<Shape>('shapes')

  const { socket } = usePartyKit({
    room,
    onMessage: (data) => {
      if (data instanceof ArrayBuffer) {
        Y.applyUpdate(doc, new Uint8Array(data))
      }
    },
  })

  // Observer para mudanças no Yjs
  useEffect(() => {
    const observer = () => {
      setShapes(shapesArray.toArray())
    }

    shapesArray.observe(observer)
    observer() // Initial

    return () => shapesArray.unobserve(observer)
  }, [shapesArray])

  const addShape = (shape: Omit<Shape, 'id'>) => {
    const newShape = { ...shape, id: crypto.randomUUID() }
    shapesArray.push([newShape])
  }

  const updateShape = (id: string, updates: Partial<Shape>) => {
    const index = shapes.findIndex(s => s.id === id)
    if (index !== -1) {
      const current = shapesArray.get(index)
      shapesArray.delete(index, 1)
      shapesArray.insert(index, [{ ...current, ...updates }])
    }
  }

  const deleteShape = (id: string) => {
    const index = shapes.findIndex(s => s.id === id)
    if (index !== -1) {
      shapesArray.delete(index, 1)
    }
  }

  return { shapes, addShape, updateShape, deleteShape }
}
```

**Tarefas:**
1. ✅ Escrever testes
2. ✅ Implementar hook
3. ✅ Integrar com PartyKit
4. ✅ Testes E2E

---

#### **3.3 - Componentes Canvas** ✅

**Seguir mesma lógica TDD:**
- Teste → Implementação → Refactor

**⚠️ IMPORTANTE - Design System:**

**REFERÊNCIA VISUAL:** `/app/canvas/page.tsx` (demo React Flow)

Todos os componentes **DEVEM** seguir o padrão visual estabelecido na demo:

**Padrões Obrigatórios:**
```tsx
// 1. Container principal
className="relative h-screen w-screen cursor-none select-none overflow-hidden
           bg-gradient-to-br from-background via-background to-muted/20"

// 2. Painéis/Cards com Glass morphism
className="rounded-lg border border-border bg-background/80 p-6
           shadow-lg backdrop-blur-sm"

// 3. Controles (toolbar)
className="flex flex-col gap-2 rounded-lg border border-border
           bg-background/80 p-2 shadow-lg backdrop-blur-sm"

// 4. Usar componentes shadcn/ui
- Button (variants: ghost, default)
- Avatar, AvatarFallback, AvatarImage
- Ícones do lucide-react

// 5. Cursores colaborativos
- Usar componentes em ~/components/kibo-ui/cursor.tsx
- Cores definidas por usuário (blue, emerald, rose, violet)
- Transições suaves: transition-all duration-1000

// 6. Background pattern
- Dots ou Grid do @xyflow/react
- Opacity reduzida: opacity-30
```

**Componentes Reutilizáveis Existentes:**
- ✅ `<Cursor>`, `<CursorPointer>`, `<CursorBody>`, `<CursorName>`, `<CursorMessage>`
- ✅ `<CanvasControls>` (zoom in/out/fit)
- ✅ `<AvatarStack>` (lista de usuários online)

**Componentes a criar:**
1. `<CanvasRoot>` - Container principal (REFATORAR para seguir padrão)
2. `<CollaborativeCursors>` - Usar componentes Cursor existentes
3. `<ShapeRenderer>` - Renderiza formas (REFATORAR para SVG com estilos)
4. `<CanvasToolbar>` - Seguir padrão CanvasControls

**Entregável:**
- ✅ Canvas colaborativo funcional
- ✅ Design consistente com shadcn/ui
- ✅ Glass morphism, backdrop blur, gradientes
- ✅ Adicionar/mover/deletar formas
- ✅ Cursores em tempo real
- ✅ Todos componentes testados

---

### **FASE 4: Persistência e Features** (2-3 dias)

#### **4.1 - Salvar Canvas no Supabase**

**Lógica:**
```typescript
// Ao sair do canvas ou periodicamente
const saveCanvas = async () => {
  const shapes = doc.getArray('shapes').toArray()

  await trpc.canvas.update.mutate({
    id: canvasId,
    shapes: shapes.map(shape => ({
      type: shape.type,
      x: shape.x,
      y: shape.y,
      // ... outros campos
    }))
  })
}
```

**Tarefas:**
1. ✅ Escrever testes de persistência
2. ✅ Implementar save automático
3. ✅ Implementar load do canvas
4. ✅ Testar sincronização Yjs ↔ Postgres

---

#### **4.2 - Features Extras**

**Com TDD:**
- Undo/Redo (Yjs tem built-in!)
- Seleção múltipla
- Copy/Paste
- Atalhos de teclado

---

### **FASE 5: E2E e Deploy** (2 dias)

#### **5.1 - Testes E2E Completos**

```typescript
// e2e/collaboration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Real-time Collaboration', () => {
  test('should sync shapes between two users', async ({ page, context }) => {
    // User 1
    await page.goto('/canvas/test-canvas')

    // User 2
    const page2 = await context.newPage()
    await page2.goto('/canvas/test-canvas')

    // User 1 adiciona retângulo
    await page.click('[data-testid="tool-rect"]')
    await page.click('[data-testid="canvas"]', { position: { x: 100, y: 100 } })

    // Espera sincronizar
    await page.waitForTimeout(500)

    // User 2 deve ver o retângulo
    await expect(page2.locator('[data-shape-type="rect"]')).toBeVisible()
  })

  test('should show cursors from other users', async ({ page, context }) => {
    await page.goto('/canvas/test')

    const page2 = await context.newPage()
    await page2.goto('/canvas/test')

    // User 1 move mouse
    await page.mouse.move(300, 400)

    // User 2 deve ver cursor
    await expect(page2.locator('[data-testid^="cursor-"]')).toBeVisible()
  })
})
```

**Tarefas:**
1. ✅ Escrever suite E2E completa
2. ✅ Testar em múltiplos navegadores
3. ✅ Testar edge cases
4. ✅ Performance testing

---

#### **5.2 - Deploy Final**

**Checklist:**
- [x] Supabase Postgres configurado
- [x] Migrations rodadas em produção
- [x] Vercel configurado com env vars (DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_PARTYKIT_HOST, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [x] PartyKit deployed (https://app-template-realtime.pedrohnas0.partykit.dev)
- [x] CI/CD funcionando (GitHub Actions - 140 testes passando)
- [ ] Monitoring configurado (Sentry?)

---

## 📈 Métricas de Sucesso

### **Cobertura de Testes**
- Unit tests: ≥ 80%
- Integration tests: ≥ 70%
- E2E: ≥ 50% dos fluxos críticos

### **Performance**
- Latência de sincronização: < 100ms
- Time to Interactive: < 3s
- Lighthouse Score: ≥ 90

### **Qualidade**
- Zero erros de TypeScript
- Zero warnings de lint
- Todos os testes passando

---

## 🔄 Workflow de Desenvolvimento

### **Dia a dia:**

```bash
# 1. Criar branch para feature
git checkout -b feat/collaborative-shapes

# 2. Escrever testes (RED)
# src/hooks/__tests__/use-shapes.test.ts

# 3. Rodar testes (devem falhar)
cd app-web
npm run test -- use-shapes

# 4. Implementar (GREEN)
# src/hooks/use-shapes.ts

# 5. Rodar testes (devem passar)
npm run test -- use-shapes

# 6. Refatorar (REFACTOR)
# Melhorar código, manter testes verdes

# 7. Commit
git add .
git commit -m "feat: add collaborative shapes hook with TDD"

# 8. Push (CI roda automaticamente)
git push origin feat/collaborative-shapes

# 9. Criar PR
gh pr create --title "feat: collaborative shapes" --body "..."

# 10. Merge (após aprovação e CI verde)
```

---

## 🎯 Próximos Passos

Após concluir Plan 01:

**Plan 02:** Autenticação e Multi-tenancy
- NextAuth.js
- Supabase Auth
- Permissões por canvas
- Compartilhamento

**Plan 03:** Features Avançadas
- Templates de canvas
- Export (PNG, SVG, PDF)
- Comentários
- Histórico de versões

**Plan 04:** Mobile e PWA
- Responsive design
- Touch gestures
- Offline support
- PWA setup

---

## 📚 Recursos e Documentação

### **Leitura obrigatória:**
- [PartyKit Docs](https://docs.partykit.io)
- [Yjs Docs](https://docs.yjs.dev)
- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com/react)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

### **Exemplos de referência:**
- [PartyKit Examples](https://github.com/partykit/partykit/tree/main/examples)
- [Yjs Demos](https://github.com/yjs/yjs-demos)
- [TDD with Next.js](https://nextjs.org/docs/testing)

---

## 🤝 Contribuindo

Este é um projeto de estudo. Siga sempre:
1. TDD (Test-Driven Development)
2. Commits semânticos
3. PR com testes
4. CI verde antes de merge

---

## ✅ Checklist de Conclusão

### **FASE 0: Setup**
- [x] Supabase configurado
- [x] Vitest configurado (app-web)
- [x] Testing Library configurado
- [x] MSW configurado (handlers e server criados)
- [x] Playwright configurado (playwright.config.ts)
- [x] Vitest configurado (app-realtime)
- [x] GitHub Actions configurados
- [x] Primeiro teste passando

### **FASE 1: Database e API**
- [x] Schema Prisma atualizado (Canvas + Shape models completos)
- [x] Router `canvas.ts` implementado (SEM testes)
- [x] Router `shape.ts` implementado (SEM testes)
- [x] Migrations rodadas
- [ ] Testes de API passando (NÃO ESCRITOS)

### **FASE 2: PartyKit**
- [x] CanvasParty com testes (29 testes passando!)
- [x] WebSocket funcionando
- [x] Yjs integrado (canvas.test.ts + yjs-sync.test.ts)
- [x] Testes de sync passando (12 testes Yjs + 17 testes CanvasParty)

### **FASE 3: Frontend**
- [x] Hook `usePartyKit` implementado (SEM testes unitários do hook)
- [x] Hook `useYjsShapes` implementado (SEM testes unitários do hook)
- [x] Componentes Canvas com testes (CollaborativeCursors: 140 testes unitários passando)
- [x] Cursores colaborativos (funcionando em produção)
- [x] Formas colaborativas (via xyflow - funcionando em produção)

### **FASE 4: Persistência**
- [ ] Save automático
- [ ] Load do canvas
- [ ] Features extras
- [ ] Testes de integração

### **FASE 5: E2E e Deploy**
- [ ] Suite E2E completa (Playwright configurado mas SEM testes E2E escritos - pasta tests/e2e não existe)
- [x] Deploy em produção (Vercel + PartyKit)
- [x] CI/CD funcionando (GitHub Actions - 140 testes unitários passando)
- [ ] Monitoring ativo

---

**Status:** 📝 Planejamento Completo - Pronto para Implementação

**Próxima Ação:** Começar FASE 0.1 - Migração para Supabase
