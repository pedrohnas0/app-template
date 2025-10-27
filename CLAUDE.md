# Guia de Desenvolvimento Claude - Regras e Boas Práticas

Este documento contém regras e boas práticas para evitar erros comuns durante o desenvolvimento.

## 🔴 Erros Comuns de Tipagem

### 1. Campos JSON do Prisma

**Problema:** Prisma usa tipos específicos para campos JSON que não são compatíveis diretamente com `Record<string, unknown>`.

**Erro:**
```typescript
// ❌ ERRADO - Causa erro de tipagem no build
return ctx.db.shape.create({
  data: input, // input.data é Record<string, unknown>
});
```

**Solução:**
```typescript
// ✅ CORRETO - Cast explícito para any no campo JSON
return ctx.db.shape.create({
  data: {
    ...input,
    data: input.data as any, // Prisma Json type workaround
  },
});
```

**Quando aplicar:**
- Sempre que usar campos `Json` do Prisma em create/update
- Ao fazer destructuring, separar o campo `data` dos demais

**Exemplo completo:**
```typescript
// Create
create: publicProcedure
  .input(shapeCreateSchema)
  .mutation(async ({ ctx, input }) => {
    return ctx.db.shape.create({
      data: {
        ...input,
        data: input.data as any, // Prisma Json type workaround
      },
    });
  }),

// Update
update: publicProcedure
  .input(shapeUpdateSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, data: shapeData, ...restData } = input;

    return ctx.db.shape.update({
      where: { id },
      data: {
        ...restData,
        ...(shapeData && { data: shapeData as any }), // Prisma Json type workaround
      },
    });
  }),
```

### 2. process.env.NODE_ENV é Read-Only

**Problema:** Tentar atribuir valor a `process.env.NODE_ENV` causa erro de compilação.

**Erro:**
```typescript
// ❌ ERRADO - Cannot assign to read-only property
process.env.NODE_ENV = "test";
```

**Solução:**
```typescript
// ✅ CORRETO - Remover a atribuição
// O NODE_ENV já é setado pelo runtime/framework

// Se precisar mockar para testes:
vi.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
    // ... outros env vars
  },
}));
```

**Quando aplicar:**
- Nunca tentar modificar `process.env.NODE_ENV` diretamente
- Usar mocks do Vitest para simular valores de env em testes

## 🧪 TDD - Regras do Ciclo RED-GREEN-REFACTOR

### Sempre seguir a ordem:

1. **RED** - Escrever testes que falham
2. **GREEN** - Implementar código mínimo para passar
3. **REFACTOR** - Melhorar código mantendo testes verdes

### Nunca pular etapas:
- ❌ Não implementar antes de ter testes
- ❌ Não refatorar se testes não passam
- ❌ Não fazer commit se testes falham

## 📝 Checklist Antes de Commit

- [ ] `npm run build` passa sem erros
- [ ] `npm run test:unit` - todos os testes passam
- [ ] `npm run check` - lint passa (se aplicável)
- [ ] Campos JSON do Prisma usam cast `as any`
- [ ] Nenhuma atribuição a `process.env.NODE_ENV`
- [ ] Todos os TODOs da fase estão completos

## 🚀 Build e CI/CD

### Antes de Push:
```bash
# 1. Rodar build localmente
cd app-web
npm run build

# 2. Rodar testes
npm run test:unit

# 3. Verificar lint
npm run check
```

### Se o build falhar no CI/CD:
1. Verificar logs do GitHub Actions
2. Reproduzir erro localmente com `npm run build`
3. Corrigir erros de tipagem comuns (ver seção acima)
4. Rodar testes novamente
5. Push após confirmar que tudo passa

## 🎯 Convenções de Código

### TypeScript
- Sempre tipar explicitamente parâmetros de função
- Usar `as any` apenas para workarounds documentados (ex: Prisma JSON)
- Preferir interfaces sobre types para objetos complexos

### Prisma
- Campos JSON precisam de cast para `any` em mutations
- Sempre incluir comentário: `// Prisma Json type workaround`
- Usar destructuring para separar campos JSON dos demais

### Tests
- Um arquivo de teste por router/module
- Agrupar testes relacionados com `describe`
- Usar `beforeEach` para setup e cleanup
- Nomear testes de forma descritiva: "should ..."

## 📚 Referências

- [Prisma JSON Fields](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#json)
- [Vitest Best Practices](https://vitest.dev/guide/best-practices.html)
- [tRPC Error Handling](https://trpc.io/docs/server/error-handling)

---

**Última atualização:** 2025-10-27
**Versão:** 1.0
