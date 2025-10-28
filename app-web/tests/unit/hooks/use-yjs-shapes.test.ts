import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import {
	type CircleShape,
	type RectShape,
	useYjsShapes,
} from "~/hooks/use-yjs-shapes";

/**
 * Testes para useYjsShapes - Hook para gerenciar shapes colaborativas com Yjs
 *
 * NOVA API (Plan 02):
 * - Não cria conexão PartyKit interna
 * - Recebe `send` função externa para enviar updates
 * - Recebe callback `onYjsUpdate` para registrar handler de updates remotos
 *
 * Testa funcionalidades de:
 * - Inicialização do Yjs Doc
 * - CRUD de shapes (add, update, delete)
 * - Envio de updates via `send` externo
 * - Aplicação de updates remotos via callback
 */

describe("useYjsShapes", () => {
	let mockSend: ReturnType<typeof vi.fn>;
	let mockOnYjsUpdate: ((handler: (update: Uint8Array) => void) => () => void) | undefined;
	let remoteUpdateHandler: ((update: Uint8Array) => void) | undefined;

	beforeEach(() => {
		mockSend = vi.fn();

		// Mock para onYjsUpdate - registra o handler e retorna cleanup
		mockOnYjsUpdate = vi.fn((handler) => {
			remoteUpdateHandler = handler;
			return () => {
				remoteUpdateHandler = undefined;
			};
		});

		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
		remoteUpdateHandler = undefined;
	});

	describe("initialization", () => {
		it("should initialize with empty shapes array", () => {
			const { result } = renderHook(() =>
				useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				})
			);

			expect(result.current.shapes).toEqual([]);
		});

		it("should register Yjs update handler via callback", () => {
			renderHook(() =>
				useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				})
			);

			// Deve ter chamado onYjsUpdate para registrar handler
			expect(mockOnYjsUpdate).toHaveBeenCalledWith(expect.any(Function));
		});
	});

	describe("addShape", () => {
		it("should add a new shape to the array", async () => {
			const { result } = renderHook(() =>
				useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				})
			);

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
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			result.current.addShape({
				type: "circle",
				x: 0,
				y: 0,
				radius: 25,
				fill: "#00ff00",
			} as Omit<CircleShape, "id">);

			result.current.addShape({
				type: "circle",
				x: 100,
				y: 100,
				radius: 50,
				fill: "#0000ff",
			} as Omit<CircleShape, "id">);

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(2);
				expect(result.current.shapes[0]?.id).not.toBe(
					result.current.shapes[1]?.id,
				);
			});
		});

		it("should send Yjs update through PartyKit after adding shape", async () => {
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			result.current.addShape({
				type: "rect",
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fill: "#000000",
			} as Omit<RectShape, "id">);

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
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			// Adicionar shape
			result.current.addShape({
				type: "rect",
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fill: "#ff0000",
			} as Omit<RectShape, "id">);

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
			} as Omit<CircleShape, "id">);

			await waitFor(() => {
				const updated = result.current.shapes[0];
				expect(updated?.x).toBe(100);
				expect(updated?.y).toBe(200);
				if ("fill" in updated!) {
					expect(updated.fill).toBe("#00ff00");
				}
			});
		});

		it("should send Yjs update after updating shape", async () => {
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			result.current.addShape({
				type: "circle",
				x: 0,
				y: 0,
				radius: 25,
				fill: "#000000",
			} as Omit<CircleShape, "id">);

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
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			expect(() => {
				result.current.updateShape("non-existent-id", { x: 100 });
			}).not.toThrow();

			expect(result.current.shapes).toHaveLength(0);
		});
	});

	describe("deleteShape", () => {
		it("should delete an existing shape", async () => {
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			// Adicionar shape
			result.current.addShape({
				type: "rect",
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fill: "#000000",
			} as Omit<RectShape, "id">);

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
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			result.current.addShape({
				type: "rect",
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fill: "#000000",
			} as Omit<RectShape, "id">);

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
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			expect(() => {
				result.current.deleteShape("non-existent-id");
			}).not.toThrow();
		});
	});

	describe("Yjs synchronization", () => {
		it("should apply remote Yjs updates", async () => {
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

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

			// Simular recebimento de update remoto via handler registrado
			if (remoteUpdateHandler) {
				remoteUpdateHandler(update);
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
			const { result } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

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

			if (remoteUpdateHandler) {
				remoteUpdateHandler(update1);
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

			if (remoteUpdateHandler) {
				remoteUpdateHandler(update2);
			}

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(2);
			});
		});

	});

	describe("TextShape with dimensions", () => {
		it("should create TextShape with width and height", async () => {
			const { result } = renderHook(() =>
				useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			const textShape = {
				type: "text" as const,
				x: 100,
				y: 200,
				text: "Hello World",
				fill: "#000000",
				fontSize: 16,
				width: 200,
				height: 60,
			};

			result.current.addShape(textShape);

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
				expect(result.current.shapes[0]).toMatchObject({
					type: "text",
					width: 200,
					height: 60,
				});
			});
		});

		it("should update TextShape dimensions", async () => {
			const { result } = renderHook(() =>
				useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			// Criar TextShape com dimensões iniciais
			result.current.addShape({
				type: "text",
				x: 0,
				y: 0,
				text: "Test",
				fill: "#000000",
				width: 100,
				height: 40,
			} as any);

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
			});

			const shapeId = result.current.shapes[0]?.id;

			// Atualizar dimensões
			result.current.updateShape(shapeId!, {
				width: 300,
				height: 100,
			} as any);

			await waitFor(() => {
				const updated = result.current.shapes[0];
				// Type narrowing: verificar que é TextShape
				if (updated?.type === "text") {
					expect(updated.width).toBe(300);
					expect(updated.height).toBe(100);
				}
			});
		});

		it("should allow TextShape without dimensions (optional)", async () => {
			const { result } = renderHook(() =>
				useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			// TextShape sem width/height (devem ser opcionais)
			const textShape = {
				type: "text" as const,
				x: 50,
				y: 50,
				text: "No dimensions",
				fill: "#ff0000",
			};

			result.current.addShape(textShape as any);

			await waitFor(() => {
				expect(result.current.shapes).toHaveLength(1);
				expect(result.current.shapes[0]?.type).toBe("text");
			});
		});
	});

	describe("cleanup", () => {
		it("should cleanup Yjs observers on unmount", () => {
			const { unmount } = renderHook(() => useYjsShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate
				}));

			// Não deve dar erro ao desmontar
			expect(() => unmount()).not.toThrow();
		});
	});
});
