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
				});
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
});
