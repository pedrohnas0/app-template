# Plan 03 - Grid Snap + Redimensionamento de Shapes

## 🎯 Objetivo

Implementar grid snap forçado (20px) e redimensionamento de shapes (rect, circle, text) com sincronização Yjs, seguindo padrões do n8n, Excalidraw e tldraw.

## 📚 Referências

- **n8n**: Grid snap de 20x20px com background alinhado
- **Excalidraw**: Resize handles (8 pontos) com constraints
- **tldraw**: Resize com snap e smart guides
- **React Flow**: NodeResizer built-in + snapToGrid API

## 🏗️ Arquitetura

### Grid Snap
- React Flow nativo: `snapToGrid={true}` + `snapGrid={[20, 20]}`
- Background visual: `Lines` variant (gap: 20px)
- Snap manual na criação: `Math.round(pos / 20) * 20`

### Redimensionamento
- Component: `ResizableShapeNode` (substitui `ShapeNode`)
- React Flow: `NodeResizer` component (built-in)
- Sincronização: `onNodesChange` → Yjs (type: 'dimensions')
- Types: Adicionar `width`/`height` ao `TextShape`

### Line Shapes
- Status: **Comentados temporariamente**
- Motivo: Resize de lines requer handles custom nas pontas
- TODO: Implementar em Plan futuro

## 📋 Implementação

### ✅ Fase 1: Grid Snap (1 dia)

**Status:** 🟡 Em andamento

#### 1.1 Testes (RED)
- [ ] Test: Shapes criados em múltiplos de 20px
- [ ] Test: Drag termina em múltiplos de 20px
- [ ] Test: Background Lines com gap=20
- [ ] Test: ReactFlow com snapToGrid={true} e snapGrid={[20,20]}

**Arquivos:**
- `tests/unit/hooks/use-reactflow-shapes.test.ts` (modificar)
- `tests/unit/components/collaborative-canvas.test.tsx` (novo)

#### 1.2 Implementação (GREEN)
- [ ] Adicionar `snapToGrid` e `snapGrid` no ReactFlow
- [ ] Trocar Background: Dots → Lines (gap: 20)
- [ ] Implementar snap manual em `handlePaneClick`
- [ ] Atualizar criação de shapes (rect, circle, text)

**Arquivos:**
- `src/app/collaborative-canvas/page.tsx` (modificar)

#### 1.3 Refatoração (REFACTOR)
- [ ] Extrair `GRID_SIZE = 20` para constante
- [ ] Criar utility `snapToGrid(x, y, gridSize)`
- [ ] Adicionar JSDoc e comentários

**Arquivos:**
- `src/lib/utils.ts` (adicionar função)
- `src/lib/constants.ts` (novo, para GRID_SIZE)

#### 1.4 Validação Manual
- [ ] Criar rect → snap no grid
- [ ] Criar circle → snap no grid
- [ ] Criar text → snap no grid
- [ ] Arrastar shape → snap ao soltar
- [ ] Zoom in/out → grid visual alinhado

---

### ⬜ Fase 2: NodeResizer (2 dias)

**Status:** ⚪ Aguardando Fase 1

#### 2.1 Atualizar Types Yjs (TDD)
- [ ] Test: TextShape com width/height
- [ ] Test: updateShape aceita dimensions
- [ ] Implementar: Adicionar width/height ao TextShape type
- [ ] Implementar: updateShape sincroniza dimensions

**Arquivos:**
- `tests/unit/hooks/use-yjs-shapes.test.ts` (modificar)
- `src/hooks/use-yjs-shapes.ts` (modificar)

#### 2.2 Criar ResizableShapeNode (TDD)
- [ ] Test: NodeResizer aparece quando selected
- [ ] Test: Rect com resize livre (width ≠ height)
- [ ] Test: Circle com keepAspectRatio={true}
- [ ] Test: Text com resize livre
- [ ] Test: Min/max constraints por tipo
- [ ] Implementar: Component ResizableShapeNode
- [ ] Implementar: Handles com classes shadcn/ui

**Arquivos:**
- `tests/unit/components/resizable-shape-node.test.tsx` (novo)
- `src/components/kibo-ui/resizable-shape-node.tsx` (novo)

#### 2.3 Integrar onNodesChange (TDD)
- [ ] Test: Dimensions change sincroniza Yjs
- [ ] Test: Rect → width/height
- [ ] Test: Circle → radius (width / 2)
- [ ] Test: Text → width/height
- [ ] Test: Não sync durante resizing=true
- [ ] Implementar: Case dimensions em onNodesChange

**Arquivos:**
- `tests/unit/hooks/use-reactflow-shapes.test.ts` (modificar)
- `src/hooks/use-reactflow-shapes.ts` (modificar)

#### 2.4 Converter Shapes para Nodes (TDD)
- [ ] Test: Rect com width/height → Node
- [ ] Test: Circle com radius → Node (width/height = radius*2)
- [ ] Test: Text com/sem dimensions → Node (default 100x40)
- [ ] Implementar: Adicionar width/height aos Nodes
- [ ] Implementar: Lógica conversão por tipo

**Arquivos:**
- `tests/unit/hooks/use-reactflow-shapes.test.ts` (modificar)
- `src/hooks/use-reactflow-shapes.ts` (modificar)

#### 2.5 Registrar nodeType
- [ ] Trocar `shapeNode: ShapeNode` → `shapeNode: ResizableShapeNode`
- [ ] Manter `cursorNode: CursorNode` (sem mudanças)

**Arquivos:**
- `src/app/collaborative-canvas/page.tsx` (modificar)

#### 2.6 Refatoração
- [ ] Extrair helper: `shapeToDimensions(shape)`
- [ ] Extrair constraints: `SHAPE_CONSTRAINTS` config
- [ ] Adicionar JSDoc
- [ ] Garantir memo() para performance

#### 2.7 Validação Manual
- [ ] Selecionar shape → handles aparecem
- [ ] Resize rect → width/height mudam
- [ ] Resize circle → mantém circular
- [ ] Resize text → bounding box ajusta
- [ ] Multi-user: resize sincroniza entre clientes

---

### ⬜ Fase 3: Comentar Line Shapes (0.5 dia)

**Status:** ⚪ Aguardando Fase 2

#### Implementação
- [ ] Comentar case "line" em handlePaneClick
- [ ] Adicionar TODO: "Line resize requer handles custom"
- [ ] Desabilitar botão Line na toolbar (ou remover)
- [ ] ResizableShapeNode: Manter case line (return null)

**Arquivos:**
- `src/app/collaborative-canvas/page.tsx` (modificar)
- `src/components/kibo-ui/toolbar.tsx` (modificar)
- `src/components/kibo-ui/resizable-shape-node.tsx` (modificar)

#### Validação
- [ ] Botão Line disabled ou não existe
- [ ] Click no canvas com "line" selecionado não cria shape
- [ ] Shapes line existentes não quebram sistema

---

### ⬜ Fase 4: Polish e Refinamento (0.5 dia)

**Status:** ⚪ Aguardando Fase 3

#### Performance
- [ ] Test: 50+ shapes → 60fps (pan, zoom, resize)
- [ ] Test: Multi-user (3 clientes) → sync < 100ms
- [ ] Otimizar: memo() em ResizableShapeNode
- [ ] Otimizar: useMemo() em conversões

#### UX/UI
- [ ] Handles tamanho adequado (h-3 w-3)
- [ ] Cores shadcn (bg-primary, border-primary/50)
- [ ] Transições suaves (hover, scale)
- [ ] Testar tema dark/light

#### Edge Cases
- [ ] Test: Resize abaixo de minWidth/minHeight
- [ ] Test: Resize durante desconexão (Yjs queue)
- [ ] Test: Resize conflitante (2 users simultâneo)
- [ ] Test: Zoom extremo (0.2x, 2x) → handles visíveis

#### Documentação
- [ ] CLAUDE.md: Seção "Grid e Redimensionamento"
- [ ] CLAUDE.md: Documentar GRID_SIZE = 20
- [ ] CLAUDE.md: Explicar NodeResizer integration
- [ ] README: Explicar ResizableShapeNode

#### Validação Final
- [ ] Build passa (npm run build)
- [ ] Testes passam (npm run test:unit)
- [ ] CI/CD passa (GitHub Actions)
- [ ] Lint OK (npm run check)

---

## 📊 Progresso Geral

| Fase | Status | Duração | Testes | Implementação | Refactor |
|------|--------|---------|--------|---------------|----------|
| **Fase 1: Grid Snap** | 🟡 Em andamento | 1 dia | 0/4 | 0/4 | 0/3 |
| **Fase 2: NodeResizer** | ⚪ Aguardando | 2 dias | 0/15 | 0/10 | 0/4 |
| **Fase 3: Comentar Line** | ⚪ Aguardando | 0.5 dia | 0/3 | 0/4 | - |
| **Fase 4: Polish** | ⚪ Aguardando | 0.5 dia | 0/7 | 0/8 | 0/4 |

**Total:** 0% completo (0/51 tarefas)

---

## 📁 Estrutura de Arquivos

### Novos Arquivos
```
app-web/src/
├── components/kibo-ui/
│   └── resizable-shape-node.tsx          # ✨ NOVO (Fase 2)
├── lib/
│   └── constants.ts                      # ✨ NOVO (Fase 1)
└── tests/unit/
    └── components/
        ├── collaborative-canvas.test.tsx # ✨ NOVO (Fase 1)
        └── resizable-shape-node.test.tsx # ✨ NOVO (Fase 2)
```

### Arquivos Modificados
```
app-web/src/
├── app/collaborative-canvas/
│   └── page.tsx                          # ✏️ Fase 1, 2, 3
├── components/kibo-ui/
│   ├── shape-node.tsx                    # 📦 Backup (deprecar após Fase 2)
│   └── toolbar.tsx                       # ✏️ Fase 3
├── hooks/
│   ├── use-reactflow-shapes.ts           # ✏️ Fase 2
│   └── use-yjs-shapes.ts                 # ✏️ Fase 2
└── lib/
    └── utils.ts                          # ✏️ Fase 1

tests/unit/
├── hooks/
│   ├── use-reactflow-shapes.test.ts      # ✏️ Fase 1, 2
│   └── use-yjs-shapes.test.ts            # ✏️ Fase 2
```

---

## 🎯 Configuração Final

### Grid
- **Size:** 20x20px
- **Background:** Lines (não Dots)
- **Snap:** Forçado (manual + automático)

### Shapes Suportadas
- ✅ **Rect:** Resize livre (width ≠ height)
- ✅ **Circle:** Resize proporcional (sempre circular)
- ✅ **Text:** Resize livre (bounding box)
- ❌ **Line:** Comentado (implementação futura)

### NodeResizer Constraints
```typescript
// Rect
minWidth: 40, maxWidth: 800
minHeight: 40, maxHeight: 600

// Circle
minWidth: 40, maxWidth: 400
keepAspectRatio: true

// Text
minWidth: 60, maxWidth: 600
minHeight: 30, maxHeight: 200
```

### Classes shadcn/ui
```tsx
lineClassName="border-primary/50 hover:border-primary transition-colors"
handleClassName="bg-primary h-3 w-3 rounded-full border-2 border-background hover:scale-125 transition-transform shadow-md"
```

---

## 🚀 Metodologia

**TDD Rigoroso:** RED → GREEN → REFACTOR

1. **RED**: Escrever teste que falha
2. **GREEN**: Implementar código mínimo para passar
3. **REFACTOR**: Melhorar código mantendo testes verdes
4. **VALIDAR**: Testar manualmente no navegador

---

## 📝 Notas

- Line shapes requerem lógica custom (handles nas pontas x1,y1 e x2,y2)
- NodeResizer do React Flow já aplica snap automaticamente quando `snapToGrid={true}`
- Yjs resolve conflitos de resize automaticamente (CRDT merge)
- Performance crítica: memo() em todos os node components
- Multi-user: Broadcast apenas quando resizing=false (final do drag)

---

**Criado em:** 2025-10-28
**Status:** 🟡 Em desenvolvimento
**Estimativa:** 4 dias
