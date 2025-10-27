import { type Session } from 'next-auth'
import { appRouter, type AppRouter } from '~/server/api/root'
import { db } from '~/server/db'

/**
 * Helper para chamar procedures tRPC diretamente em testes
 *
 * Cria um caller que pode executar queries e mutations sem HTTP
 * Útil para testes de integração dos routers
 *
 * @example
 * ```ts
 * import { createCaller } from 'tests/helpers/trpc-caller'
 *
 * test('creates a post', async () => {
 *   const caller = createCaller({ userId: 'test-user' })
 *   const post = await caller.post.create({ name: 'Test Post' })
 *   expect(post.name).toBe('Test Post')
 * })
 * ```
 */

interface CreateCallerOptions {
  /**
   * ID do usuário para simular autenticação
   */
  userId?: string
  /**
   * Sessão completa do NextAuth (opcional)
   */
  session?: Session | null
}

export function createCaller(options: CreateCallerOptions = {}) {
  const { userId, session } = options

  // Cria contexto mockado para o tRPC
  const mockSession: Session | null = session ?? (userId
    ? {
        user: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    : null)

  const ctx = {
    session: mockSession,
    db,
  }

  return appRouter.createCaller(ctx)
}

/**
 * Tipo helper para inferir tipos dos procedures
 */
export type Caller = ReturnType<typeof createCaller>

/**
 * Tipo helper para extrair input de um procedure
 */
export type RouterInput = Parameters<Caller[keyof Caller]['query']>[0]

/**
 * Tipo helper para extrair output de um procedure
 */
export type RouterOutput = Awaited<ReturnType<Caller[keyof Caller]['query']>>
