import { http, HttpResponse } from "msw";

/**
 * MSW Handlers - Mock API requests
 *
 * Adicione handlers aqui para mockar chamadas HTTP/tRPC em testes de integração
 *
 * @example
 * ```ts
 * // Mock tRPC endpoint
 * export const handlers = [
 *   http.get('/api/trpc/post.getLatest', () => {
 *     return HttpResponse.json({
 *       result: {
 *         data: { id: 1, name: 'Test Post', createdAt: new Date() }
 *       }
 *     })
 *   }),
 * ]
 * ```
 */
export const handlers = [
	// Exemplo: Mock health check
	http.get("/api/health", () => {
		return HttpResponse.json({ status: "ok" });
	}),

	// Adicione mais handlers conforme necessário
	// Mock tRPC calls aqui quando criar os routers
];
