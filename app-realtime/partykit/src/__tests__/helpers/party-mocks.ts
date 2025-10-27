import { vi } from 'vitest'
import type * as Party from 'partykit/server'

/**
 * Mock helpers para testes do PartyKit
 *
 * Fornece mocks de Connection, Room e Context para testar Party Servers
 */

/**
 * Cria uma Connection mockada
 */
export function createMockConnection(id: string = 'test-connection'): Party.Connection {
  return {
    id,
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    state: 'open',
    socket: {} as WebSocket,
    readyState: 1,
    uri: `ws://localhost:1999/party/${id}`,
    serializeAttachment: vi.fn((value) => JSON.stringify(value)),
    deserializeAttachment: vi.fn((value) => JSON.parse(value)),
  } as Party.Connection
}

/**
 * Cria uma Room mockada
 */
export function createMockRoom(id: string = 'test-room'): Party.Room {
  const connections = new Map<string, Party.Connection>()

  return {
    id,
    env: {},
    parties: {} as Party.Parties,
    context: {
      parties: {} as Party.Parties,
      waitUntil: vi.fn(),
    } as Party.ExecutionContext,
    storage: {} as DurableObjectStorage,
    getConnections: vi.fn(() => Array.from(connections.values())),
    getConnection: vi.fn((id: string) => connections.get(id)),
    broadcast: vi.fn((message: string | ArrayBuffer | ArrayBufferView, except?: string[]) => {
      const exceptSet = new Set(except || [])
      for (const [connId, conn] of connections) {
        if (!exceptSet.has(connId)) {
          conn.send(message as any)
        }
      }
    }),
    internalID: id,
    _addConnection: (conn: Party.Connection) => {
      connections.set(conn.id, conn)
    },
    _removeConnection: (connId: string) => {
      connections.delete(connId)
    },
  } as Party.Room & {
    _addConnection: (conn: Party.Connection) => void
    _removeConnection: (connId: string) => void
  }
}

/**
 * Cria um ConnectionContext mockado
 */
export function createMockConnectionContext(): Party.ConnectionContext {
  return {
    request: new Request('http://localhost:1999/party/test-room'),
  } as Party.ConnectionContext
}

/**
 * Helper para testar broadcasts
 */
export function assertBroadcastCalled(
  room: ReturnType<typeof createMockRoom>,
  message: any,
  except?: string[]
) {
  const broadcastMock = room.broadcast as ReturnType<typeof vi.fn>

  expect(broadcastMock).toHaveBeenCalled()

  const calls = broadcastMock.mock.calls
  const lastCall = calls[calls.length - 1]

  if (typeof message === 'object' && !(message instanceof ArrayBuffer)) {
    expect(lastCall[0]).toBe(JSON.stringify(message))
  } else {
    expect(lastCall[0]).toBe(message)
  }

  if (except) {
    expect(lastCall[1]).toEqual(except)
  }
}
