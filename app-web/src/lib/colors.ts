/**
 * Utilitários para geração de cores
 */

// Paleta de cores vibrantes para cursores colaborativos
const CURSOR_COLORS = [
	"#FF6B6B", // Vermelho vibrante
	"#4ECDC4", // Turquesa
	"#45B7D1", // Azul claro
	"#FFA07A", // Salmão
	"#98D8C8", // Verde água
	"#F7DC6F", // Amarelo dourado
	"#BB8FCE", // Roxo claro
	"#85C1E9", // Azul céu
	"#F8B739", // Laranja
	"#52C2A5", // Verde mar
] as const;

/**
 * Gera uma cor consistente para um user ID
 *
 * Usa um hash simples do userId para mapear para uma cor da paleta
 * A mesma entrada sempre produz a mesma cor
 *
 * @param userId - ID único do usuário
 * @returns Cor em formato hex (#RRGGBB)
 *
 * @example
 * ```ts
 * const color = getUserColor('user-123')
 * console.log(color) // '#FF6B6B' (sempre a mesma para 'user-123')
 * ```
 */
export function getUserColor(userId: string): string {
	// Hash simples: soma dos char codes
	let hash = 0;
	for (let i = 0; i < userId.length; i++) {
		hash = userId.charCodeAt(i) + ((hash << 5) - hash);
	}

	// Usa valor absoluto e faz módulo pelo tamanho da paleta
	const index = Math.abs(hash) % CURSOR_COLORS.length;

	return CURSOR_COLORS[index];
}
