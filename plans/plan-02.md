# Plan 02 - Correção de Sincronização e Coordenadas

**Data:** 2025-10-27
**Status:** Em Progresso
**Objetivo:** Corrigir bugs de sincronização de shapes e coordenadas de cursores

---

## 🔍 Problemas Identificados

### 1. Shapes não sincronizam entre navegadores 🔴 CRÍTICO

**Sintoma:**
- Shapes só aparecem no navegador que as criou
- Cursores funcionam perfeitamente entre navegadores

**Diagnóstico:**
- **2 conexões WebSocket** na mesma room (`demo-canvas`)
  1. Conexão em `useYjsShapes` (via `useReactFlowShapes`)
     - Processa: ArrayBuffer (Yjs updates)
     - Envia: Yjs updates quando shapes mudam
  2. Conexão na página `collaborative-canvas/page.tsx`
     - Processa: APENAS JSON com `data.type === "cursor"`
     - **IGNORA ArrayBuffer** ❌
     - Envia: cursor updates

**Fluxo do bug:**
```
Navegador A cria shape
  → useYjsShapes envia ArrayBuffer (Yjs update)
  → Servidor PartyKit faz broadcast
  → Navegador B recebe ArrayBuffer em AMBAS conexões
     ✅ Conexão 1 (useYjsShapes): Aplica update no Yjs
     ❌ Conexão 2 (página): Ignora (só processa cursor)
  → Estado React não atualiza no Navegador B
```

**Evidências no código:**
- `app-web/src/app/collaborative-canvas/page.tsx:78-107`
  - Handler só processa `data.type === "cursor"` e `data.type === "user-left"`
  - ArrayBuffer é ignorado silenciosamente

---

### 2. Cursores têm coordenadas de tela ao invés de canvas 🟡 IMPORTANTE

**Sintoma:**
- Cursores "flutuam" pela tela
- Não acompanham zoom/pan do React Flow
- Coordenadas parecem ser relativas à viewport

**Diagnóstico:**
- **Sistemas de coordenadas diferentes:**
  - **Cursores:** Porcentagem (0-100%) do container
    - `collaborative-canvas/page.tsx:129-130`
    - `const x = ((e.clientX - bounds.left) / bounds.width) * 100`
  - **Shapes:** Pixels absolutos do canvas
    - `collaborative-canvas/page.tsx:172-173`
    - `const x = event.clientX - bounds.left`

**Por que isso é ruim:**
- Cursores não respeitam transformações do React Flow (zoom/pan)
- Coordenadas % não fazem sentido num canvas com zoom
- Inconsistência visual confusa para o usuário

---

## ✅ Soluções Propostas

### Solução 1: Unificar Conexão PartyKit

**Objetivo:** Usar UMA única conexão WebSocket que processa AMBOS os tipos de mensagem.

**Implementação:**

#### 1.1. Refatorar `useYjsShapes` para aceitar conexão externa

**Antes:**
```typescript
// useYjsShapes cria sua própria conexão
const { send } = usePartyKit({ room, onMessage: ... });
```

**Depois:**
```typescript
// useYjsShapes recebe send + onYjsUpdate externos
export function useYjsShapes(options: {
  room: string;
  send: (data: unknown) => void;
  onYjsUpdate?: (handler: (update: Uint8Array) => void) => () => void;
})
```

#### 1.2. Atualizar página para processar AMBOS tipos

**Antes:**
```typescript
const { send } = usePartyKit({
  room: roomId,
  onMessage: (data) => {
    if (data.type === "cursor") { /* ... */ }
  }
});
```

**Depois:**
```typescript
const { send } = usePartyKit({
  room: roomId,
  onMessage: (data) => {
    // Processar ArrayBuffer (Yjs)
    if (data instanceof ArrayBuffer) {
      applyYjsUpdate(data);
      return;
    }

    // Processar JSON (cursores)
    if (data.type === "cursor") { /* ... */ }
  }
});
```

**Arquivos a modificar:**
- `app-web/src/hooks/use-yjs-shapes.ts`
- `app-web/src/hooks/use-reactflow-shapes.ts`
- `app-web/src/app/collaborative-canvas/page.tsx`

**Testes a atualizar:**
- `tests/unit/hooks/use-yjs-shapes.test.ts`
- `tests/unit/hooks/use-reactflow-shapes.test.ts`

---

### Solução 2: Padronizar Coordenadas em Pixels

**Objetivo:** Cursores e shapes usarem PIXELS absolutos do canvas React Flow.

**Implementação:**

#### 2.1. Converter cursores para pixels

**Antes:**
```typescript
const x = ((e.clientX - bounds.left) / bounds.width) * 100;  // %
```

**Depois:**
```typescript
const x = e.clientX - bounds.left;  // pixels
```

#### 2.2. Considerar transformações do React Flow

**Opcional (futuro):**
- Usar `screenToFlowPosition` do React Flow
- Cursores acompanhariam zoom/pan
- Mais complexo, deixar para depois se necessário

**Arquivos a modificar:**
- `app-web/src/app/collaborative-canvas/page.tsx` (handlePointerMove)

**Testes a criar:**
- Teste de coordenadas de cursores
- Verificar que x,y estão em pixels

---

## 📋 Checklist de Implementação

### Fase 1: Correção de Sincronização (Solução 1)

- [ ] **1.1** RED: Escrever teste para `useYjsShapes` com conexão externa
- [ ] **1.2** GREEN: Refatorar `useYjsShapes` para aceitar `send` externo
- [ ] **1.3** REFACTOR: Limpar código, melhorar tipos
- [ ] **1.4** RED: Escrever teste para `useReactFlowShapes` com nova API
- [ ] **1.5** GREEN: Atualizar `useReactFlowShapes`
- [ ] **1.6** REFACTOR: Otimizar
- [ ] **1.7** RED: Escrever teste de integração na página
- [ ] **1.8** GREEN: Atualizar página para processar ArrayBuffer
- [ ] **1.9** REFACTOR: Extrair lógica de handlers
- [ ] **1.10** Testar manualmente: shapes sincronizam entre navegadores? ✅

### Fase 2: Correção de Coordenadas (Solução 2)

- [ ] **2.1** RED: Escrever teste para coordenadas em pixels
- [ ] **2.2** GREEN: Converter cursores para pixels
- [ ] **2.3** REFACTOR: Simplificar cálculo de coordenadas
- [ ] **2.4** Testar manualmente: cursores acompanham shapes? ✅

### Fase 3: Validação Final

- [ ] **3.1** Rodar todos os testes: `npm run test:unit`
- [ ] **3.2** Verificar build: `npm run build` (com .env configurado)
- [ ] **3.3** Testar E2E manual:
  - [ ] Abrir 2 navegadores
  - [ ] Criar shapes em um, aparecem no outro
  - [ ] Mover cursor, aparece no outro
  - [ ] Drag shape, sincroniza posição
- [ ] **3.4** Atualizar CLAUDE.md com status

---

## 🎯 Critérios de Sucesso

1. ✅ Shapes sincronizam em tempo real entre navegadores
2. ✅ Cursores usam mesma escala que shapes (pixels)
3. ✅ UMA única conexão WebSocket por cliente
4. ✅ Todos os testes passando (156+)
5. ✅ Zero erros de TypeScript
6. ✅ Código refatorado e limpo

---

## 📝 Notas de Implementação

### Por que não usar `y-partykit`?

Inicialmente consideramos usar o provider oficial `y-partykit`, mas:
- ❌ Mais uma abstração para debugar
- ❌ Menos controle sobre conexão
- ✅ Nossa solução manual é mais simples e explícita
- ✅ Facilita processar outros tipos de mensagem (cursores)

### Alternativas consideradas

**Para Solução 1:**
- ~~Opção A: Criar context provider global para PartyKit~~
  - Muito overhead para um caso simples
- ✅ **Opção B: Passar `send` como prop/param**
  - Simples, explícito, fácil de testar

**Para Solução 2:**
- ~~Opção A: Manter % mas ajustar renderização~~
  - Não resolve o problema conceitual
- ✅ **Opção B: Usar pixels absolutos**
  - Consistente com shapes
  - Mais fácil de raciocinar

---

## 🔗 Referências

- **Plan 01:** `/plans/plan-01.md` - Implementação original
- **CLAUDE.md:** `/CLAUDE.md` - Status do projeto
- **PartyKit Docs:** https://docs.partykit.io
- **Yjs Docs:** https://docs.yjs.dev

---

**Versão:** 1.0
**Última atualização:** 2025-10-27
