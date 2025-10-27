# Plans - Sistema de Planejamento

Pasta para documentar planos de implementação, decisões arquiteturais e registro de progresso.

## 📁 Estrutura

```
plans/
├── README.md              # Este arquivo
├── plan-01.md             # Implementação Colaborativa com TDD
├── plan-02.md             # (Futuro) Autenticação
├── plan-03.md             # (Futuro) Features Avançadas
└── implementations/       # Registros de implementação
    ├── 2025-10-27.md     # Diário de implementação
    └── decisions/        # ADRs (Architecture Decision Records)
```

## 📝 Template de Plan

Cada plan deve conter:

1. **Objetivo** - O que será implementado
2. **Duração Estimada** - Tempo previsto
3. **Arquitetura** - Diagramas e decisões
4. **Stack Tecnológica** - Dependências e versões
5. **Fases de Implementação** - Breakdown detalhado
6. **Estratégia de Testes** - TDD approach
7. **Checklist de Conclusão** - Como saber que terminou

## 🎯 Plans Atuais

### Plan 01 - Implementação Colaborativa com TDD
**Status:** 📝 Planejamento Completo

**Objetivo:** Canvas colaborativo com PartyKit + Supabase, implementado com TDD

**Fases:**
- FASE 0: Setup e Infraestrutura (2-3 dias)
- FASE 1: Database e API (3-4 dias)
- FASE 2: PartyKit Server (3-4 dias)
- FASE 3: Frontend - Canvas Colaborativo (4-5 dias)
- FASE 4: Persistência e Features (2-3 dias)
- FASE 5: E2E e Deploy (2 dias)

**Total:** 14-18 dias

[Ver detalhes →](./plan-01.md)

---

### Plan 02 - Autenticação e Multi-tenancy
**Status:** 🔜 Futuro

**Objetivo:** Sistema de auth com Supabase Auth + permissões

---

### Plan 03 - Features Avançadas
**Status:** 🔜 Futuro

**Objetivo:** Templates, export, comentários, histórico

---

## 📊 Workflow

### 1. Criar novo Plan
```bash
# Copiar template
cp plans/template.md plans/plan-XX.md

# Editar
code plans/plan-XX.md
```

### 2. Durante implementação
```bash
# Registrar progresso diário
code plans/implementations/$(date +%Y-%m-%d).md
```

### 3. Decisões arquiteturais
```bash
# Criar ADR (Architecture Decision Record)
code plans/implementations/decisions/001-escolha-partykit.md
```

### 4. Concluir Plan
- [ ] Marcar todas as tarefas como concluídas
- [ ] Atualizar status para ✅ Concluído
- [ ] Documentar lições aprendidas

## 🧭 Navegação

- [← Voltar para README principal](../README.md)
- [Plan 01 - Implementação Colaborativa →](./plan-01.md)

## 💡 Dicas

- **Siga o TDD:** Red → Green → Refactor
- **Documente decisões:** Use ADRs para registrar "por quês"
- **Atualize o plan:** Se algo mudar, atualize o documento
- **Celebre marcos:** Marque checkboxes quando completar fases

---

**Próximo Plan:** Plan 02 - Autenticação (aguardando Plan 01)
