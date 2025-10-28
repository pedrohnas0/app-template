/**
 * Feature Flags
 *
 * Centralized feature flag management for gradual rollouts
 * and A/B testing.
 *
 * @example
 * ```ts
 * import { FEATURES } from '~/lib/feature-flags';
 *
 * if (FEATURES.USE_CURSOR_NODES) {
 *   // New implementation
 * } else {
 *   // Old implementation
 * }
 * ```
 */

export const FEATURES = {
	/**
	 * USE_CURSOR_NODES
	 *
	 * Renderiza cursores colaborativos como React Flow Nodes
	 * em vez de overlay absoluto.
	 *
	 * Benefícios:
	 * - ✅ Zero lag com zoom/pan (60fps constante)
	 * - ✅ Sincronização perfeita com shapes
	 * - ✅ Tamanho fixo do cursor (scale compensation)
	 * - ✅ GPU-accelerated (transform3d)
	 *
	 * Quando habilitar:
	 * - Após testes unitários passarem (CursorNode)
	 * - Após validação manual (2 navegadores)
	 * - Quando pronto para produção
	 *
	 * Relacionado: Plan 02 - Refatoração de Cursores
	 */
	USE_CURSOR_NODES:
		process.env.NEXT_PUBLIC_USE_CURSOR_NODES === "true" || false,
} as const;

/**
 * Type-safe feature flag checker
 */
export type FeatureFlag = keyof typeof FEATURES;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
	return FEATURES[flag] === true;
}
