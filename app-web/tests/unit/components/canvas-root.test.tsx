import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CanvasRoot } from "~/components/kibo-ui/canvas-root";
import type { Shape } from "~/hooks/use-yjs-shapes";

/**
 * Testes para CanvasRoot - Container principal do canvas colaborativo
 *
 * Testa funcionalidades de:
 * - Renderização do canvas SVG
 * - Integração com useYjsShapes
 * - Renderização de múltiplas shapes
 * - Seleção de shapes
 * - Dimensões do canvas
 */

// Mock do useYjsShapes
let mockShapes: Shape[] = [];
let mockAddShape: ReturnType<typeof vi.fn>;
let mockUpdateShape: ReturnType<typeof vi.fn>;
let mockDeleteShape: ReturnType<typeof vi.fn>;
let mockUseYjsShapes: ReturnType<typeof vi.fn>;

vi.mock("~/hooks/use-yjs-shapes", () => ({
	useYjsShapes: vi.fn(() => ({
		shapes: mockShapes,
		addShape: mockAddShape,
		updateShape: mockUpdateShape,
		deleteShape: mockDeleteShape,
	})),
}));

describe("CanvasRoot", () => {
	beforeEach(async () => {
		mockShapes = [];
		mockAddShape = vi.fn();
		mockUpdateShape = vi.fn();
		mockDeleteShape = vi.fn();

		// Obter mock do useYjsShapes
		const module = await import("~/hooks/use-yjs-shapes");
		mockUseYjsShapes = module.useYjsShapes as ReturnType<typeof vi.fn>;

		vi.clearAllMocks();
	});

	describe("rendering", () => {
		it("should render an SVG canvas", () => {
			const { container } = render(<CanvasRoot room="test-room" />);

			const svg = container.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});

		it("should render with default dimensions", () => {
			const { container } = render(<CanvasRoot room="test-room" />);

			const svg = container.querySelector("svg");
			expect(svg).toHaveAttribute("width", "800");
			expect(svg).toHaveAttribute("height", "600");
		});

		it("should render with custom dimensions", () => {
			const { container } = render(
				<CanvasRoot room="test-room" width={1000} height={800} />,
			);

			const svg = container.querySelector("svg");
			expect(svg).toHaveAttribute("width", "1000");
			expect(svg).toHaveAttribute("height", "800");
		});

		it("should have white background by default", () => {
			const { container } = render(<CanvasRoot room="test-room" />);

			const svg = container.querySelector("svg");
			const rect = svg?.querySelector("rect");
			expect(rect).toHaveAttribute("fill", "white");
		});
	});

	describe("shapes integration", () => {
		it("should render shapes from useYjsShapes", () => {
			mockShapes = [
				{
					id: "shape-1",
					type: "rect",
					x: 100,
					y: 100,
					width: 50,
					height: 50,
					fill: "#ff0000",
				},
			];

			const { container } = render(<CanvasRoot room="test-room" />);

			const rect = container.querySelector('rect[data-shape-id="shape-1"]');
			expect(rect).toBeInTheDocument();
		});

		it("should render multiple shapes", () => {
			mockShapes = [
				{
					id: "rect-1",
					type: "rect",
					x: 0,
					y: 0,
					width: 50,
					height: 50,
					fill: "#ff0000",
				},
				{
					id: "circle-1",
					type: "circle",
					x: 100,
					y: 100,
					radius: 25,
					fill: "#00ff00",
				},
				{
					id: "text-1",
					type: "text",
					x: 200,
					y: 200,
					text: "Test",
					fill: "#000000",
				},
			];

			const { container } = render(<CanvasRoot room="test-room" />);

			expect(container.querySelector('rect[data-shape-id="rect-1"]')).toBeInTheDocument();
			expect(container.querySelector('circle[data-shape-id="circle-1"]')).toBeInTheDocument();
			expect(screen.getByText("Test")).toBeInTheDocument();
		});

		it("should connect to correct room", () => {
			render(<CanvasRoot room="my-canvas-123" />);

			expect(mockUseYjsShapes).toHaveBeenCalledWith("my-canvas-123");
		});
	});

	describe("selection", () => {
		it("should track selected shape", async () => {
			mockShapes = [
				{
					id: "shape-1",
					type: "rect",
					x: 0,
					y: 0,
					width: 50,
					height: 50,
					fill: "#000000",
				},
			];

			const { container } = render(<CanvasRoot room="test-room" />);

			const rect = container.querySelector('rect[data-shape-id="shape-1"]');

			// Click na shape para selecionar
			fireEvent.click(rect!);

			// Aguardar re-render e verificar estilo de seleção
			await waitFor(() => {
				const updatedRect = container.querySelector('rect[data-shape-id="shape-1"]');
				expect(updatedRect).toHaveAttribute("stroke", "#2563eb");
			});
		});

		it("should deselect when clicking on background", async () => {
			mockShapes = [
				{
					id: "shape-1",
					type: "rect",
					x: 0,
					y: 0,
					width: 50,
					height: 50,
					fill: "#000000",
				},
			];

			const { container } = render(<CanvasRoot room="test-room" />);

			const rect = container.querySelector('rect[data-shape-id="shape-1"]');
			const background = container.querySelector('rect[fill="white"]');

			// Selecionar shape
			fireEvent.click(rect!);

			await waitFor(() => {
				const updatedRect = container.querySelector('rect[data-shape-id="shape-1"]');
				expect(updatedRect).toHaveAttribute("stroke", "#2563eb");
			});

			// Click no background
			fireEvent.click(background!);

			// Shape não deve mais estar selecionada
			await waitFor(() => {
				const updatedRect = container.querySelector('rect[data-shape-id="shape-1"]');
				expect(updatedRect).not.toHaveAttribute("stroke");
			});
		});
	});

	describe("accessibility", () => {
		it("should have canvas role", () => {
			const { container } = render(<CanvasRoot room="test-room" />);

			const svg = container.querySelector("svg");
			expect(svg).toHaveAttribute("role", "img");
		});

		it("should have aria-label", () => {
			const { container } = render(<CanvasRoot room="test-room" />);

			const svg = container.querySelector("svg");
			expect(svg).toHaveAttribute("aria-label");
		});
	});
});
