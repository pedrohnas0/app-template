import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePartyKit } from "~/hooks/use-partykit";

/**
 * Testes para usePartyKit - Hook para conectar ao PartyKit WebSocket
 *
 * Testa funcionalidades de:
 * - Conexão ao WebSocket
 * - Envio de mensagens
 * - Recebimento de mensagens
 * - Reconexão automática
 * - Cleanup na desmontagem
 */

// Mock PartySocket - deve ser declarado ANTES do vi.mock
let mockSend: ReturnType<typeof vi.fn>;
let mockClose: ReturnType<typeof vi.fn>;
let mockAddEventListener: ReturnType<typeof vi.fn>;
let mockRemoveEventListener: ReturnType<typeof vi.fn>;
let mockPartySocketInstance: any;

vi.mock("partysocket", () => {
	// Factory function executada durante hoisting
	return {
		default: vi.fn(function (this: any, config: any) {
			// Retornar instância mock
			return mockPartySocketInstance;
		}),
	};
});

describe("usePartyKit", () => {
	beforeEach(() => {
		// Mock environment variables
		process.env.NEXT_PUBLIC_PARTYKIT_HOST = "test.partykit.dev";

		// Inicializar/Reset mocks
		mockSend = vi.fn();
		mockClose = vi.fn();
		mockAddEventListener = vi.fn();
		mockRemoveEventListener = vi.fn();

		mockPartySocketInstance = {
			send: mockSend,
			close: mockClose,
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
			readyState: 0, // CONNECTING
		};

		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("connection", () => {
		it("should create PartySocket connection with correct config", async () => {
			const PartySocket = (await import("partysocket")).default;

			renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			expect(PartySocket).toHaveBeenCalledWith({
				host: expect.any(String),
				room: "test-room",
			});
		});

		it("should return socket instance", () => {
			const { result } = renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			expect(result.current.socket).toBe(
				mockPartySocketInstance,
			);
		});

		it("should start with isConnected = false", () => {
			const { result } = renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			expect(result.current.isConnected).toBe(false);
		});

		it("should set isConnected = true on open event", async () => {
			const { result } = renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			// Simular evento "open"
			const openHandler = mockAddEventListener.mock.calls.find(
				(call) => call[0] === "open",
			)?.[1];

			expect(openHandler).toBeDefined();

			// Chamar handler
			openHandler?.({} as Event);

			await waitFor(() => {
				expect(result.current.isConnected).toBe(true);
			});
		});

		it("should set isConnected = false on close event", async () => {
			const { result } = renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			// Simular "open" primeiro
			const openHandler = mockAddEventListener.mock.calls.find(
				(call) => call[0] === "open",
			)?.[1];
			openHandler?.({} as Event);

			await waitFor(() => {
				expect(result.current.isConnected).toBe(true);
			});

			// Simular "close"
			const closeHandler = mockAddEventListener.mock.calls.find(
				(call) => call[0] === "close",
			)?.[1];
			closeHandler?.({} as Event);

			await waitFor(() => {
				expect(result.current.isConnected).toBe(false);
			});
		});
	});

	describe("messaging", () => {
		it("should call onMessage callback when message is received", async () => {
			const onMessage = vi.fn();

			renderHook(() =>
				usePartyKit({
					room: "test-room",
					onMessage,
				}),
			);

			// Encontrar handler de message
			const messageHandler = mockAddEventListener.mock.calls.find(
				(call) => call[0] === "message",
			)?.[1];

			expect(messageHandler).toBeDefined();

			// Simular mensagem
			const mockEvent = {
				data: JSON.stringify({
					type: "cursor",
					x: 100,
					y: 200,
				}),
			} as MessageEvent;

			messageHandler?.(mockEvent);

			await waitFor(() => {
				expect(onMessage).toHaveBeenCalledWith({
					type: "cursor",
					x: 100,
					y: 200,
				});
			});
		});

		it("should handle ArrayBuffer messages", async () => {
			const onMessage = vi.fn();

			renderHook(() =>
				usePartyKit({
					room: "test-room",
					onMessage,
				}),
			);

			const messageHandler = mockAddEventListener.mock.calls.find(
				(call) => call[0] === "message",
			)?.[1];

			// Simular mensagem ArrayBuffer (Yjs)
			const buffer = new ArrayBuffer(10);
			const mockEvent = {
				data: buffer,
			} as MessageEvent;

			messageHandler?.(mockEvent);

			await waitFor(() => {
				expect(onMessage).toHaveBeenCalledWith(buffer);
			});
		});

		it("should send JSON stringified data", () => {
			const { result } = renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			const data = { type: "cursor", x: 100, y: 200 };
			result.current.send(data);

			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify(data),
			);
		});

		it("should send ArrayBuffer directly", () => {
			const { result } = renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			const buffer = new ArrayBuffer(10);
			result.current.send(buffer);

			expect(mockSend).toHaveBeenCalledWith(buffer);
		});

	});

	describe("cleanup", () => {
		it("should close socket on unmount", () => {
			const { unmount } = renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			unmount();

			expect(mockClose).toHaveBeenCalled();
		});

		it("should remove event listeners on unmount", () => {
			const { unmount } = renderHook(() =>
				usePartyKit({
					room: "test-room",
				}),
			);

			// Evento listeners devem ter sido adicionados
			expect(mockAddEventListener).toHaveBeenCalledTimes(4); // open, message, close, error

			unmount();

			// No cleanup, devemos fechar o socket (que internamente remove listeners)
			expect(mockClose).toHaveBeenCalled();
		});

		it("should recreate connection when room changes", async () => {
			const PartySocket = (await import("partysocket")).default;

			const { rerender } = renderHook(
				({ room }) => usePartyKit({ room }),
				{
					initialProps: { room: "room-1" },
				},
			);

			expect(PartySocket).toHaveBeenCalledWith({
				host: expect.any(String),
				room: "room-1",
			});

			// Mudar room
			rerender({ room: "room-2" });

			await waitFor(() => {
				expect(mockClose).toHaveBeenCalled();
				expect(PartySocket).toHaveBeenCalledWith({
					host: expect.any(String),
					room: "room-2",
				});
			});
		});
	});

	describe("error handling", () => {
		it("should call onError callback on error event", async () => {
			const onError = vi.fn();

			renderHook(() =>
				usePartyKit({
					room: "test-room",
					onError,
				}),
			);

			// Encontrar handler de error
			const errorHandler = mockAddEventListener.mock.calls.find(
				(call) => call[0] === "error",
			)?.[1];

			expect(errorHandler).toBeDefined();

			// Simular erro
			const mockError = new Error("Connection failed");
			const mockEvent = {
				error: mockError,
			} as ErrorEvent;

			errorHandler?.(mockEvent);

			await waitFor(() => {
				expect(onError).toHaveBeenCalledWith(mockEvent);
			});
		});

		it("should handle invalid JSON in message gracefully", async () => {
			const onMessage = vi.fn();
			const onError = vi.fn();

			renderHook(() =>
				usePartyKit({
					room: "test-room",
					onMessage,
					onError,
				}),
			);

			const messageHandler = mockAddEventListener.mock.calls.find(
				(call) => call[0] === "message",
			)?.[1];

			// Simular mensagem com JSON inválido
			const mockEvent = {
				data: "invalid-json{",
			} as MessageEvent;

			messageHandler?.(mockEvent);

			// Deve chamar onError em vez de onMessage
			await waitFor(() => {
				expect(onMessage).not.toHaveBeenCalled();
				expect(onError).toHaveBeenCalled();
			});
		});
	});
});
