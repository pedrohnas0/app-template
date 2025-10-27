import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import { useYjsShapes } from "~/hooks/use-yjs-shapes";

/**
 * Testes para useYjsShapes - Hook para gerenciar shapes colaborativas com Yjs
 *
 * Testa funcionalidades de:
 * - Inicialização do Yjs Doc
 * - CRUD de shapes (add, update, delete)
 * - Sincronização com PartyKit
 * - Observers do Yjs
 * - Integração com usePartyKit
 */

// Mock do usePartyKit
let mockSend: ReturnType<typeof vi.fn>;
let mockSocket: any;
let mockOnMessage: ((data: unknown) => void) | undefined;
let mockUsePartyKit: ReturnType<typeof vi.fn>;

vi.mock("~/hooks/use-partykit", () => ({
	usePartyKit: vi.fn((options: any) => {
		// Guardar callback para simular mensagens
		mockOnMessage = options.onMessage;

		return {
			socket: mockSocket,
			isConnected: true,
			send: mockSend,
		};
	}),
}));

describe("useYjsShapes", () => {
	beforeEach(async () => {
		mockSend = vi.fn();
		mockSocket = { readyState: 1 }; // OPEN
		mockOnMessage = undefined;

		// Obter mock do usePartyKit
		const module = await import("~/hooks/use-partykit");
		mockUsePartyKit = module.usePartyKit as ReturnType<typeof vi.fn>;

		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("initialization", () => {
		it("should initialize with empty shapes array", () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			expect(result.current.shapes).toEqual([]);
		});

		it("should create Yjs document and shapes array", () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			// Deve ter criado um Yjs Doc internamente
			expect(result.current.shapes).toBeDefined();
		});

		it("should connect to PartyKit with correct room", () => {
			renderHook(() => useYjsShapes("test-room-123"));

			expect(mockUsePartyKit).toHaveBeenCalledWith(
				expect.objectContaining({
					room: "test-room-123",
					onMessage: expect.any(Function),
				}),
			);
		});
	});

	describe("addShape", () => {
		it("should add a new shape to the array", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			const newShape = {
				type: "rect" as const,
				x: 100,
				y: 200,
				width: 50,
				height: 30,
				fill: "#ff0000",
			};

			result.current.addShape(newShape);

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
				expect(result.current.shapes[0]).toMatchObject(newShape);
				expect(result.current.shapes[0]?.id).toBeDefined();
			});
		});

		it("should generate unique ID for new shape", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			result.current.addShape({
				type: "circle",
				x: 0,
				y: 0,
				radius: 25,
				fill: "#00ff00",
			});

			result.current.addShape({
				type: "circle",
				x: 100,
				y: 100,
				radius: 50,
				fill: "#0000ff",
			});

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(2);
				expect(result.current.shapes[0]?.id).not.toBe(
					result.current.shapes[1]?.id,
				);
			});
		});

		it("should send Yjs update through PartyKit after adding shape", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			result.current.addShape({
				type: "rect",
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fill: "#000000",
			});

			await waitFor(() => {
				expect(mockSend).toHaveBeenCalled();
				// Deve enviar um ArrayBuffer (Yjs update)
				expect(mockSend.mock.calls[0]?.[0]).toBeInstanceOf(
					Uint8Array,
				);
			});
		});
	});

	describe("updateShape", () => {
		it("should update an existing shape", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			// Adicionar shape
			result.current.addShape({
				type: "rect",
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fill: "#ff0000",
			});

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
			});

			const shapeId = result.current.shapes[0]?.id;
			expect(shapeId).toBeDefined();

			// Atualizar shape
			result.current.updateShape(shapeId!, {
				x: 100,
				y: 200,
				fill: "#00ff00",
			});

			await waitFor(() => {
				const updated = result.current.shapes[0];
				expect(updated?.x).toBe(100);
				expect(updated?.y).toBe(200);
				expect(updated?.fill).toBe("#00ff00");
			});
		});

		it("should send Yjs update after updating shape", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			result.current.addShape({
				type: "circle",
				x: 0,
				y: 0,
				radius: 25,
				fill: "#000000",
			});

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
			});

			const shapeId = result.current.shapes[0]?.id;

			// Limpar calls anteriores
			mockSend.mockClear();

			result.current.updateShape(shapeId!, { x: 50 });

			await waitFor(() => {
				expect(mockSend).toHaveBeenCalled();
			});
		});

		it("should not error when updating non-existent shape", () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			expect(() => {
				result.current.updateShape("non-existent-id", { x: 100 });
			}).not.toThrow();

			expect(result.current.shapes).toHaveLength(0);
		});
	});

	describe("deleteShape", () => {
		it("should delete an existing shape", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			// Adicionar shape
			result.current.addShape({
				type: "rect",
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fill: "#000000",
			});

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
			});

			const shapeId = result.current.shapes[0]?.id;

			// Deletar shape
			result.current.deleteShape(shapeId!);

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(0);
			});
		});

		it("should send Yjs update after deleting shape", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			result.current.addShape({
				type: "rect",
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fill: "#000000",
			});

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
			});

			const shapeId = result.current.shapes[0]?.id;

			// Limpar calls
			mockSend.mockClear();

			result.current.deleteShape(shapeId!);

			await waitFor(() => {
				expect(mockSend).toHaveBeenCalled();
			});
		});

		it("should not error when deleting non-existent shape", () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			expect(() => {
				result.current.deleteShape("non-existent-id");
			}).not.toThrow();
		});
	});

	describe("Yjs synchronization", () => {
		it("should apply remote Yjs updates", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			// Criar um doc remoto
			const remoteDoc = new Y.Doc();
			const remoteShapes = remoteDoc.getArray("shapes");

			// Adicionar shape remotamente
			remoteShapes.push([
				{
					id: "remote-1",
					type: "circle",
					x: 50,
					y: 50,
					radius: 30,
					fill: "#ff00ff",
				},
			]);

			// Criar update do remote doc
			const update = Y.encodeStateAsUpdate(remoteDoc);

			// Simular recebimento da mensagem
			if (mockOnMessage) {
				mockOnMessage(update);
			}

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
				expect(result.current.shapes[0]).toMatchObject({
					id: "remote-1",
					type: "circle",
					x: 50,
					y: 50,
				});
			});
		});

		it("should handle multiple remote updates", async () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			const remoteDoc = new Y.Doc();
			const remoteShapes = remoteDoc.getArray("shapes");

			// Update 1: adicionar shape
			remoteShapes.push([
				{
					id: "shape-1",
					type: "rect",
					x: 0,
					y: 0,
					width: 100,
					height: 100,
					fill: "#000000",
				},
			]);

			const update1 = Y.encodeStateAsUpdate(remoteDoc);

			if (mockOnMessage) {
				mockOnMessage(update1);
			}

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
			});

			// Update 2: adicionar outro shape
			remoteShapes.push([
				{
					id: "shape-2",
					type: "circle",
					x: 200,
					y: 200,
					radius: 50,
					fill: "#ffffff",
				},
			]);

			const update2 = Y.encodeStateAsUpdate(remoteDoc);

			if (mockOnMessage) {
				mockOnMessage(update2);
			}

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(2);
			});
		});

		it("should ignore non-ArrayBuffer messages", () => {
			const { result } = renderHook(() => useYjsShapes("test-room"));

			// Mensagem JSON (não Yjs)
			if (mockOnMessage) {
				mockOnMessage({ type: "cursor", x: 100, y: 200 });
			}

			// Não deve quebrar
			expect(result.current.shapes).toHaveLength(0);
		});
	});

	describe("cleanup", () => {
		it("should cleanup Yjs observers on unmount", () => {
			const { unmount } = renderHook(() => useYjsShapes("test-room"));

			// Não deve dar erro ao desmontar
			expect(() => unmount()).not.toThrow();
		});
	});
});
