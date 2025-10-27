import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as Y from 'yjs'
import CanvasParty from './canvas'
import {
  createMockRoom,
  createMockConnection,
  createMockConnectionContext,
  assertBroadcastCalled,
} from './__tests__/helpers/party-mocks'

/**
 * Testes para CanvasParty - WebSocket server para colaboração
 *
 * Testa funcionalidades de:
 * - Conexão de usuários
 * - Broadcast de mensagens (cursores, presença)
 * - Desconexão de usuários
 * - Tratamento de erros
 */

describe('CanvasParty', () => {
  let party: CanvasParty
  let mockRoom: ReturnType<typeof createMockRoom>

  beforeEach(() => {
    // Setup fresh mocks para cada teste
    mockRoom = createMockRoom('test-canvas')
    party = new CanvasParty(mockRoom)

    // Limpar console.log/error mocks
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('onConnect', () => {
    it('should send sync message with user count when user connects', () => {
      const conn = createMockConnection('user-1')
      const ctx = createMockConnectionContext()

      // Adicionar algumas conexões existentes
      mockRoom._addConnection(createMockConnection('existing-1'))
      mockRoom._addConnection(createMockConnection('existing-2'))

      party.onConnect(conn, ctx)

      expect(conn.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'sync',
          users: 2, // Duas conexões já existentes
        })
      )
    })

    it('should send sync with 0 users when first user connects', () => {
      const conn = createMockConnection('user-1')
      const ctx = createMockConnectionContext()

      party.onConnect(conn, ctx)

      expect(conn.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'sync',
          users: 0,
        })
      )
    })

    it('should log connection', () => {
      const conn = createMockConnection('user-1')
      const ctx = createMockConnectionContext()

      party.onConnect(conn, ctx)

      expect(console.log).toHaveBeenCalledWith(
        'User user-1 connected to room test-canvas'
      )
    })
  })

  describe('onMessage', () => {
    it('should broadcast cursor updates to other users', () => {
      const sender = createMockConnection('user-1')
      mockRoom._addConnection(sender)

      const message = {
        type: 'cursor',
        userId: 'user-1',
        name: 'John',
        avatar: 'avatar.png',
        x: 100,
        y: 200,
        color: '#FF0000',
      }

      party.onMessage(JSON.stringify(message), sender)

      assertBroadcastCalled(mockRoom, message, ['user-1'])
    })

    it('should broadcast presence updates', () => {
      const sender = createMockConnection('user-2')
      mockRoom._addConnection(sender)

      const message = {
        type: 'presence',
        userId: 'user-2',
        name: 'Jane',
        avatar: 'jane.png',
        color: '#00FF00',
      }

      party.onMessage(JSON.stringify(message), sender)

      assertBroadcastCalled(mockRoom, message, ['user-2'])
    })

    it('should not broadcast to sender', () => {
      const sender = createMockConnection('user-1')
      const other = createMockConnection('user-2')

      mockRoom._addConnection(sender)
      mockRoom._addConnection(other)

      const message = {
        type: 'cursor',
        userId: 'user-1',
        name: 'John',
        avatar: 'avatar.png',
        x: 100,
        y: 200,
        color: '#FF0000',
      }

      party.onMessage(JSON.stringify(message), sender)

      // Broadcast deve ser chamado excluindo o sender
      expect(mockRoom.broadcast).toHaveBeenCalledWith(
        JSON.stringify(message),
        ['user-1']
      )
    })

    it('should handle invalid JSON gracefully', () => {
      const sender = createMockConnection('user-1')

      party.onMessage('invalid-json', sender)

      expect(console.error).toHaveBeenCalledWith(
        'Failed to parse message:',
        expect.any(Error)
      )

      // Não deve fazer broadcast de mensagem inválida
      expect(mockRoom.broadcast).not.toHaveBeenCalled()
    })
  })

  describe('onClose', () => {
    it('should broadcast user-left message when user disconnects', () => {
      const conn = createMockConnection('user-1')

      party.onClose(conn)

      assertBroadcastCalled(
        mockRoom,
        {
          type: 'user-left',
          userId: 'user-1',
        },
        ['user-1']
      )
    })

    it('should log disconnection', () => {
      const conn = createMockConnection('user-1')

      party.onClose(conn)

      expect(console.log).toHaveBeenCalledWith(
        'User user-1 disconnected from room test-canvas'
      )
    })
  })

  describe('onError', () => {
    it('should log errors', () => {
      const conn = createMockConnection('user-1')
      const error = new Error('Test error')

      party.onError(conn, error)

      expect(console.error).toHaveBeenCalledWith(
        'Error for user user-1:',
        error
      )
    })
  })

  describe('multi-user scenarios', () => {
    it('should handle multiple users connecting and sending messages', () => {
      const user1 = createMockConnection('user-1')
      const user2 = createMockConnection('user-2')
      const user3 = createMockConnection('user-3')

      // Conectar usuários
      party.onConnect(user1, createMockConnectionContext())
      mockRoom._addConnection(user1)

      party.onConnect(user2, createMockConnectionContext())
      mockRoom._addConnection(user2)

      party.onConnect(user3, createMockConnectionContext())
      mockRoom._addConnection(user3)

      // User1 envia cursor
      const message = {
        type: 'cursor',
        userId: 'user-1',
        name: 'User 1',
        avatar: 'avatar1.png',
        x: 50,
        y: 75,
        color: '#FF0000',
      }

      party.onMessage(JSON.stringify(message), user1)

      // Deve broadcast para user2 e user3, mas não para user1
      expect(mockRoom.broadcast).toHaveBeenCalledWith(
        JSON.stringify(message),
        ['user-1']
      )
    })

    it('should handle user leaving and notify others', () => {
      const user1 = createMockConnection('user-1')
      const user2 = createMockConnection('user-2')

      mockRoom._addConnection(user1)
      mockRoom._addConnection(user2)

      // User1 desconecta
      party.onClose(user1)
      mockRoom._removeConnection('user-1')

      // Outros usuários devem ser notificados
      expect(mockRoom.broadcast).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'user-left',
          userId: 'user-1',
        }),
        ['user-1']
      )
    })
  })

  describe('Yjs integration', () => {
    it('should have a Yjs document', () => {
      expect(party.doc).toBeDefined()
      expect(party.doc).toBeInstanceOf(Y.Doc)
    })

    it('should send Yjs state to new connection', () => {
      const conn = createMockConnection('user-1')
      const ctx = createMockConnectionContext()

      // Adicionar dados ao doc
      const shapes = party.doc.getArray('shapes')
      shapes.push([{ id: 'shape-1', type: 'rect', x: 0, y: 0 }])

      party.onConnect(conn, ctx)

      // Deve enviar estado Yjs (ArrayBuffer/Uint8Array)
      expect(conn.send).toHaveBeenCalledWith(expect.any(Uint8Array))
    })

    it('should handle Yjs updates as ArrayBuffer', () => {
      const sender = createMockConnection('user-1')
      mockRoom._addConnection(sender)

      // Criar um update Yjs
      const doc = new Y.Doc()
      const shapes = doc.getArray('shapes')
      shapes.push([{ id: 'shape-1', type: 'rect', x: 0, y: 0 }])
      const update = Y.encodeStateAsUpdate(doc)

      // Enviar update como ArrayBuffer
      party.onMessage(update.buffer, sender)

      // Deve aplicar o update e fazer broadcast
      expect(mockRoom.broadcast).toHaveBeenCalledWith(
        expect.any(ArrayBuffer),
        ['user-1']
      )

      // Verificar que o shape foi adicionado ao doc do party
      const partyShapes = party.doc.getArray('shapes')
      expect(partyShapes.length).toBe(1)
      expect(partyShapes.get(0)).toMatchObject({
        id: 'shape-1',
        type: 'rect',
      })
    })

    it('should sync shapes between multiple clients via Yjs', () => {
      const user1 = createMockConnection('user-1')
      const user2 = createMockConnection('user-2')

      mockRoom._addConnection(user1)
      mockRoom._addConnection(user2)

      // User1 conecta e recebe estado inicial (vazio)
      party.onConnect(user1, createMockConnectionContext())

      // User1 adiciona shape
      const doc1 = new Y.Doc()
      const shapes1 = doc1.getArray('shapes')
      shapes1.push([{ id: 'shape-1', type: 'rect', x: 0, y: 0 }])
      const update1 = Y.encodeStateAsUpdate(doc1)

      party.onMessage(update1.buffer, user1)

      // Party doc deve ter o shape
      const partyShapes = party.doc.getArray('shapes')
      expect(partyShapes.length).toBe(1)

      // Broadcast deve ter sido chamado para user2
      expect(mockRoom.broadcast).toHaveBeenCalledWith(
        expect.any(ArrayBuffer),
        ['user-1']
      )
    })

    it('should still handle JSON messages (cursor, presence)', () => {
      const sender = createMockConnection('user-1')
      mockRoom._addConnection(sender)

      const message = {
        type: 'cursor',
        userId: 'user-1',
        name: 'John',
        avatar: 'avatar.png',
        x: 100,
        y: 200,
        color: '#FF0000',
      }

      // Enviar como string (não ArrayBuffer)
      party.onMessage(JSON.stringify(message), sender)

      // Deve fazer broadcast como string
      expect(mockRoom.broadcast).toHaveBeenCalledWith(
        JSON.stringify(message),
        ['user-1']
      )
    })
  })
})
