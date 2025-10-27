import type { AppRouter } from "~/server/api/root";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

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
 *   const caller = createCaller()
 *   const post = await caller.post.create({ name: 'Test Post' })
 *   expect(post.name).toBe('Test Post')
 * })
 * ```
 */

export function createCaller() {
	// Cria contexto mockado para o tRPC (similar ao contexto real)
	const mockHeaders = new Headers();

	const ctx = {
		db,
		headers: mockHeaders,
	};

	return appRouter.createCaller(ctx);
}

/**
 * Tipo helper para inferir tipos dos procedures
 */
export type Caller = ReturnType<typeof createCaller>;
