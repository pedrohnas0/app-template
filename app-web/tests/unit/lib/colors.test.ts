import { describe, it, expect } from 'vitest'
import { getUserColor } from '~/lib/colors'

/**
 * Testes para utilitários de cores
 *
 * TDD RED: Este teste vai falhar porque getUserColor ainda não existe
 */

describe('getUserColor', () => {
  it('should return a consistent color for the same user ID', () => {
    const userId = 'user-123'
    const color1 = getUserColor(userId)
    const color2 = getUserColor(userId)

    expect(color1).toBe(color2)
  })

  it('should return different colors for different users', () => {
    const color1 = getUserColor('user-1')
    const color2 = getUserColor('user-2')
    const color3 = getUserColor('user-3')

    expect(color1).not.toBe(color2)
    expect(color2).not.toBe(color3)
    expect(color1).not.toBe(color3)
  })

  it('should return a valid hex color', () => {
    const color = getUserColor('user-123')

    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('should return colors suitable for cursors (bright/vibrant)', () => {
    const colors = [
      getUserColor('user-1'),
      getUserColor('user-2'),
      getUserColor('user-3'),
      getUserColor('user-4'),
      getUserColor('user-5'),
    ]

    // Todas as cores devem ser hex válidas
    colors.forEach((color) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    // Deve ter pelo menos 3 cores diferentes para 5 usuários
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBeGreaterThanOrEqual(3)
  })
})
