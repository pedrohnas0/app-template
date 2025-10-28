# Claude Code - Guia do Projeto

## 📋 Visão Geral

**Stack:** T3 Stack (Next.js 15 + tRPC + Prisma + TypeScript)
**Monorepo:** `app-web` (Next.js) + `app-realtime` (PartyKit)
**DB:** Supabase PostgreSQL
**Real-time:** PartyKit (WebSocket + Yjs CRDT)
**Deploy:** Vercel + Cloudflare Workers

### Estrutura
```
app-template/
├── app-web/          # Next.js app
│   ├── src/
│   │   ├── app/      # Pages (App Router)
│   │   ├── server/   # tRPC API
│   │   ├── components/ # React components
│   │   └── hooks/    # Custom hooks
│   ├── tests/        # Vitest + Playwright
│   └── prisma/       # DB schema
└── app-realtime/     # PartyKit WebSocket
    └── partykit/
        └── src/      # Canvas Party server
```

### Features Implementadas
- ✅ Canvas colaborativo (`/collaborative-canvas`)
- ✅ Cursores em tempo real (PartyKit)
- ✅ React Flow (zoom, pan, controls)
- ✅ API tRPC (Canvas + Shape routers)
- ✅ Testes: 169 unitários passando (140 web + 29 PartyKit)

## ⚠️ Erros Comuns

### Prisma JSON Fields
Campos `Json` precisam cast para `any`:
```ts
// ❌ Erro: ctx.db.shape.create({ data: input })
// ✅ Correto:
ctx.db.shape.create({
  data: { ...input, data: input.data as any }
})
```

### process.env.NODE_ENV
Read-only - nunca atribuir. Use mocks em testes:
```ts
vi.mock("~/env", () => ({ env: { NODE_ENV: "test" } }))
```

## 🧪 Metodologia TDD

**Ciclo:** RED → GREEN → REFACTOR (não pular etapas)
**Status:** Parcialmente seguido (PartyKit 100% TDD, routers sem testes)

## ✅ Checklist Pré-Commit

```bash
cd app-web
npm run build      # TypeScript OK?
npm run test:unit  # Testes passando?
npm run check      # Lint OK?
```

## 🏗️ Arquitetura

### Comunicação
- **Frontend ↔ tRPC API:** REST-like com type-safety
- **Frontend ↔ PartyKit:** WebSocket (cursores em tempo real)
- **PartyKit ↔ Yjs:** CRDT para shapes colaborativas (não integrado com persistência ainda)

### Routers tRPC
- `canvas`: CRUD de canvas (sem testes)
- `shape`: CRUD de shapes (sem testes)
- `post`: Exemplo T3 Stack

### Componentes Chave
- `CollaborativeCursors`: Cursores colaborativos (140 testes)
- `CanvasControls`: Zoom in/out/fit (React Flow)
- `usePartyKit`: Hook WebSocket (sem testes)
- `useYjsShapes`: Hook CRDT (sem testes)

## 🚫 Gaps Conhecidos

- ❌ Testes E2E não escritos (Playwright configurado)
- ❌ Testes de API (routers canvas/shape)
- ❌ Testes de hooks (usePartyKit, useYjsShapes)
- ❌ FASE 4 não implementada (persistência save/load)
- ❌ Integração Yjs ↔ Postgres

## 📦 Convenções

**TypeScript:** Tipos explícitos, `as any` só com comentário
**Prisma:** Campos JSON precisam cast (`as any`)
**Testes:** `describe` + `it("should...")` + `beforeEach`
**Git:** Commits semânticos (`feat:`, `fix:`, `refactor:`)

## 🔗 Links Úteis

- **Prod:** https://app-template-tan.vercel.app/collaborative-canvas
- **PartyKit:** https://app-template-realtime.pedrohnas0.partykit.dev
- **Plano:** `/plans/plan-01.md`

---

**Versão:** 2.0 | **Última atualização:** 2025-10-27
