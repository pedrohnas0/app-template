# ADR 001: PartyKit vs Supabase Realtime para Colaboração

**Data:** 2025-10-27
**Status:** ✅ Aceita
**Decisores:** Pedro, Claude

---

## Contexto

Precisamos escolher uma solução de real-time para implementar:
- Cursores colaborativos
- Sincronização de formas no canvas
- Edição simultânea por múltiplos usuários

Opções consideradas:
1. Supabase Realtime (Broadcast)
2. PartyKit (Cloudflare Workers + Durable Objects)
3. Implementação customizada com WebSocket

---

## Decisão

**Escolhemos PartyKit** para o serviço de colaboração em tempo real.

---

## Justificativa

### Por que PartyKit?

✅ **CRDT Nativo (Yjs)**
- Suporte nativo para Yjs (via `y-partykit`)
- Resolução automática de conflitos
- Perfeito para edição colaborativa de formas

✅ **Latência Baixa**
- Roda na edge da Cloudflare (300+ cidades)
- WebSocket direto, sem intermediários
- ~20-50ms de latência vs ~50-100ms do Supabase

✅ **Separação de Responsabilidades**
- PartyKit: Real-time CRDT
- Supabase: Persistência + Auth
- Cada ferramenta faz o que faz de melhor

✅ **Zero Administração**
- Deploy com `partykit deploy`
- Escala automático na Cloudflare
- Sem VPS para gerenciar

✅ **Custo**
- Free tier: 100GB/mês
- Depois: $0.20/GB
- Competitivo com Supabase

### Por que NÃO Supabase Realtime?

❌ **Broadcast é Ephemeral**
- Não persiste mensagens
- Se recarregar, perde estado
- Precisa salvar manualmente no Postgres

❌ **Sem CRDT**
- Conflitos ao editar simultaneamente
- Precisa implementar resolução manual
- Complexo para formas

❌ **Postgres Changes é Lento**
- Escreve no banco primeiro (~100-200ms)
- Não ideal para edição em tempo real
- Overhead desnecessário

❌ **Limitado para Colaboração Complexa**
- Ótimo para cursores e presence
- Não ideal para sync de documento

---

## Consequências

### Positivas ✅

1. **Melhor UX**
   - Latência menor
   - Sincronização mais confiável
   - Undo/Redo automático (Yjs)

2. **Código Mais Simples**
   - Yjs cuida do CRDT
   - Menos lógica de merge manual
   - Menos bugs de sincronização

3. **Arquitetura Clara**
   ```
   Supabase: Banco + Auth
   PartyKit: Real-time + CRDT
   Next.js: UI + API
   ```

4. **Escalabilidade**
   - Cloudflare escala automaticamente
   - Edge computing global
   - Performance previsível

### Negativas ⚠️

1. **Mais um Serviço**
   - Precisa gerenciar deploy do PartyKit
   - Mais uma variável de ambiente
   - Mais complexidade arquitetural

2. **Curva de Aprendizado**
   - Yjs é novo para nós
   - PartyKit API diferente
   - Durable Objects concepts

3. **Dependência de Vendor**
   - PartyKit é da Cloudflare
   - Se mudar preços, afeta

### Mitigações 🛡️

Para as negativas:

1. **CI/CD Automático**
   - Deploy automático via GitHub Actions
   - Zero esforço manual

2. **Documentação**
   - Criar docs de Yjs internos
   - Exemplos no código
   - Tutorial para novos devs

3. **Abstração**
   - Criar interface genérica
   - Se precisar migrar, trocar implementação
   - Não acoplado ao PartyKit diretamente

---

## Alternativas Consideradas

### 1. Apenas Supabase Realtime
**Prós:** Menos complexidade, um serviço a menos
**Contras:** Limitado, sem CRDT, latência maior
**Decisão:** Rejeitada

### 2. WebSocket Customizado (Socket.io)
**Prós:** Controle total
**Contras:** Precisa VPS, manutenção, sem CRDT nativo
**Decisão:** Rejeitada (não quer administrar infra)

### 3. Liveblocks
**Prós:** Feito para colaboração, fácil
**Contras:** SaaS proprietário, sem self-hosting
**Decisão:** Rejeitada (quer controle)

---

## Validação

Vamos validar com:
- ✅ Testes de latência (< 100ms)
- ✅ Testes de conflito (múltiplos usuários editando)
- ✅ Testes de escala (50+ usuários simultâneos)
- ✅ Custo real em 3 meses

Se não funcionar, podemos:
1. Migrar para Supabase Realtime (simples)
2. Ou implementar WebSocket customizado

---

## Referências

- [PartyKit Docs](https://docs.partykit.io)
- [Yjs Docs](https://docs.yjs.dev)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)

---

## Revisões

- **2025-10-27:** Decisão inicial (v1)

---

**Status:** ✅ Implementação iniciada em Plan 01
