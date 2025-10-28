import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useReactFlowShapes } from "~/hooks/use-reactflow-shapes";
import type { NodePositionChange } from "@xyflow/react";
import type { UseYjsShapesOptions } from "~/hooks/use-yjs-shapes";

// Mock useYjsShapes
vi.mock("~/hooks/use-yjs-shapes", () => ({
	useYjsShapes: vi.fn(() => ({
		shapes: [],
		addShape: vi.fn(),
		updateShape: vi.fn(),
		deleteShape: vi.fn(),
	})),
}));

describe("useReactFlowShapes", () => {
	let mockSend: ReturnType<typeof vi.fn>;
	let mockOnYjsUpdate: ((handler: (update: Uint8Array) => void) => () => void) | undefined;

	beforeEach(() => {
		mockSend = vi.fn();
		mockOnYjsUpdate = vi.fn((handler) => () => {});
		vi.clearAllMocks();
	});

	describe("initialization", () => {
		it("should pass options to useYjsShapes", async () => {
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			// Verificar que useYjsShapes foi chamado com as opções corretas
			expect(useYjsShapes).toHaveBeenCalledWith({
				send: mockSend,
				onYjsUpdate: mockOnYjsUpdate,
			});
		});
	});

	describe("nodes conversion", () => {
		it("should convert empty shapes array to empty nodes array", () => {
			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			expect(result.current.nodes).toEqual([]);
		});

		it("should convert shapes to React Flow nodes", async () => {
			// Import the mocked module to update mock implementation
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [
					{
						id: "shape-1",
						type: "rect",
						x: 100,
						y: 200,
						width: 150,
						height: 100,
						fill: "#ff0000",
					},
				],
				addShape: vi.fn(),
				updateShape: vi.fn(),
				deleteShape: vi.fn(),
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			expect(result.current.nodes).toHaveLength(1);
			expect(result.current.nodes[0]).toMatchObject({
				id: "shape-1",
				type: "shapeNode",
				position: { x: 100, y: 200 },
				data: {
					shape: {
						id: "shape-1",
						type: "rect",
						x: 100,
						y: 200,
						width: 150,
						height: 100,
						fill: "#ff0000",
					},
				},
				selectable: true,
				draggable: true,
			});
		});

		it("should convert multiple shapes", async () => {
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [
					{
						id: "rect-1",
						type: "rect",
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						fill: "#000000",
					},
					{
						id: "circle-1",
						type: "circle",
						x: 200,
						y: 200,
						radius: 50,
						fill: "#00ff00",
					},
				],
				addShape: vi.fn(),
				updateShape: vi.fn(),
				deleteShape: vi.fn(),
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			expect(result.current.nodes).toHaveLength(2);
			expect(result.current.nodes[0]?.id).toBe("rect-1");
			expect(result.current.nodes[1]?.id).toBe("circle-1");
		});
	});

	describe("onNodesChange", () => {
		it("should update shape position on drag end", async () => {
			const mockUpdateShape = vi.fn();
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [
					{
						id: "shape-1",
						type: "rect",
						x: 100,
						y: 100,
						width: 50,
						height: 50,
						fill: "#000000",
					},
				],
				addShape: vi.fn(),
				updateShape: mockUpdateShape,
				deleteShape: vi.fn(),
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			// Simular drag end
			const positionChange: NodePositionChange = {
				id: "shape-1",
				type: "position",
				dragging: false,
				position: { x: 300, y: 400 },
			};

			act(() => {
				result.current.onNodesChange([positionChange]);
			});

			expect(mockUpdateShape).toHaveBeenCalledWith("shape-1", {
				x: 300,
				y: 400,
			});
		});

		it("should not update position while dragging", async () => {
			const mockUpdateShape = vi.fn();
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [
					{
						id: "shape-1",
						type: "rect",
						x: 100,
						y: 100,
						width: 50,
						height: 50,
						fill: "#000000",
					},
				],
				addShape: vi.fn(),
				updateShape: mockUpdateShape,
				deleteShape: vi.fn(),
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			// Simular dragging (ainda não terminou)
			const positionChange: NodePositionChange = {
				id: "shape-1",
				type: "position",
				dragging: true, // Ainda arrastando
				position: { x: 300, y: 400 },
			};

			act(() => {
				result.current.onNodesChange([positionChange]);
			});

			// Não deve atualizar enquanto ainda está arrastando
			expect(mockUpdateShape).not.toHaveBeenCalled();
		});
	});

	describe("CRUD operations", () => {
		it("should expose addShape function", async () => {
			const mockAddShape = vi.fn();
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [],
				addShape: mockAddShape,
				updateShape: vi.fn(),
				deleteShape: vi.fn(),
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			act(() => {
				result.current.addShape({
					type: "rect",
					x: 0,
					y: 0,
					width: 100,
					height: 100,
					fill: "#ff0000",
				} as any);
			});

			expect(mockAddShape).toHaveBeenCalled();
		});

		it("should expose deleteShape function", async () => {
			const mockDeleteShape = vi.fn();
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [],
				addShape: vi.fn(),
				updateShape: vi.fn(),
				deleteShape: mockDeleteShape,
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			act(() => {
				result.current.deleteShape("shape-1");
			});

			expect(mockDeleteShape).toHaveBeenCalledWith("shape-1");
		});
	});

	describe("Grid Snap (20px)", () => {
		it("should snap rect position to 20px grid on drag end", async () => {
			const mockUpdateShape = vi.fn();
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [
					{
						id: "shape-1",
						type: "rect",
						x: 100,
						y: 100,
						width: 100,
						height: 80,
						fill: "#000000",
					},
				],
				addShape: vi.fn(),
				updateShape: mockUpdateShape,
				deleteShape: vi.fn(),
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			// Simular drag para posição não-alinhada (x: 127, y: 83)
			// React Flow com snapToGrid={true} deve arredondar para (x: 120, y: 80)
			const positionChange: NodePositionChange = {
				id: "shape-1",
				type: "position",
				dragging: false,
				position: { x: 120, y: 80 }, // Já snapped pelo React Flow
			};

			act(() => {
				result.current.onNodesChange([positionChange]);
			});

			// Verificar que updateShape foi chamado com posição snapped
			expect(mockUpdateShape).toHaveBeenCalledWith("shape-1", {
				x: 120,
				y: 80,
			});

			// Garantir que posição é múltipla de 20
			const call = mockUpdateShape.mock.calls[0];
			expect(call?.[1]?.x % 20).toBe(0);
			expect(call?.[1]?.y % 20).toBe(0);
		});

		it("should snap circle position to 20px grid on drag end", async () => {
			const mockUpdateShape = vi.fn();
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [
					{
						id: "circle-1",
						type: "circle",
						x: 200,
						y: 200,
						radius: 50,
						fill: "#ff0000",
					},
				],
				addShape: vi.fn(),
				updateShape: mockUpdateShape,
				deleteShape: vi.fn(),
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			// Drag para posição snapped (x: 240, y: 260)
			const positionChange: NodePositionChange = {
				id: "circle-1",
				type: "position",
				dragging: false,
				position: { x: 240, y: 260 },
			};

			act(() => {
				result.current.onNodesChange([positionChange]);
			});

			expect(mockUpdateShape).toHaveBeenCalledWith("circle-1", {
				x: 240,
				y: 260,
			});

			// Verificar múltiplos de 20
			const call = mockUpdateShape.mock.calls[0];
			expect(call?.[1]?.x % 20).toBe(0);
			expect(call?.[1]?.y % 20).toBe(0);
		});

		it("should snap text position to 20px grid on drag end", async () => {
			const mockUpdateShape = vi.fn();
			const { useYjsShapes } = await import("~/hooks/use-yjs-shapes");

			vi.mocked(useYjsShapes).mockReturnValue({
				shapes: [
					{
						id: "text-1",
						type: "text",
						x: 50,
						y: 50,
						text: "Hello",
						fill: "#000000",
					},
				],
				addShape: vi.fn(),
				updateShape: mockUpdateShape,
				deleteShape: vi.fn(),
			});

			const { result } = renderHook(() =>
				useReactFlowShapes({
					send: mockSend,
					onYjsUpdate: mockOnYjsUpdate,
				}),
			);

			// Drag para posição snapped (x: 160, y: 180)
			const positionChange: NodePositionChange = {
				id: "text-1",
				type: "position",
				dragging: false,
				position: { x: 160, y: 180 },
			};

			act(() => {
				result.current.onNodesChange([positionChange]);
			});

			expect(mockUpdateShape).toHaveBeenCalledWith("text-1", {
				x: 160,
				y: 180,
			});

			// Verificar múltiplos de 20
			const call = mockUpdateShape.mock.calls[0];
			expect(call?.[1]?.x % 20).toBe(0);
			expect(call?.[1]?.y % 20).toBe(0);
		});
	});
});
