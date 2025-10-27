import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShapeRenderer } from "~/components/kibo-ui/shape-renderer";
import type {
	CircleShape,
	LineShape,
	RectShape,
	TextShape,
} from "~/hooks/use-yjs-shapes";

/**
 * Testes para ShapeRenderer - Componente que renderiza shapes no canvas
 *
 * Testa funcionalidades de:
 * - Renderização de diferentes tipos de shapes (rect, circle, text, line)
 * - Aplicação correta de estilos e posições
 * - Eventos de interação (click, drag)
 * - Data attributes para testes
 */

describe("ShapeRenderer", () => {
	describe("rect shape", () => {
		it("should render a rectangle shape", () => {
			const shape: RectShape = {
				id: "rect-1",
				type: "rect",
				x: 100,
				y: 200,
				width: 150,
				height: 100,
				fill: "#ff0000",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const rect = container.querySelector("rect");
			expect(rect).toBeInTheDocument();
		});

		it("should apply correct position and dimensions to rectangle", () => {
			const shape: RectShape = {
				id: "rect-2",
				type: "rect",
				x: 50,
				y: 75,
				width: 200,
				height: 150,
				fill: "#00ff00",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const rect = container.querySelector("rect");
			expect(rect).toHaveAttribute("x", "50");
			expect(rect).toHaveAttribute("y", "75");
			expect(rect).toHaveAttribute("width", "200");
			expect(rect).toHaveAttribute("height", "150");
		});

		it("should apply fill color to rectangle", () => {
			const shape: RectShape = {
				id: "rect-3",
				type: "rect",
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				fill: "#0000ff",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const rect = container.querySelector("rect");
			expect(rect).toHaveAttribute("fill", "#0000ff");
		});

		it("should add data-shape-id attribute to rectangle", () => {
			const shape: RectShape = {
				id: "rect-test-id",
				type: "rect",
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				fill: "#000000",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const rect = container.querySelector("rect");
			expect(rect).toHaveAttribute("data-shape-id", "rect-test-id");
		});
	});

	describe("circle shape", () => {
		it("should render a circle shape", () => {
			const shape: CircleShape = {
				id: "circle-1",
				type: "circle",
				x: 100,
				y: 100,
				radius: 50,
				fill: "#ff00ff",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const circle = container.querySelector("circle");
			expect(circle).toBeInTheDocument();
		});

		it("should apply correct position and radius to circle", () => {
			const shape: CircleShape = {
				id: "circle-2",
				type: "circle",
				x: 150,
				y: 200,
				radius: 75,
				fill: "#00ffff",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const circle = container.querySelector("circle");
			expect(circle).toHaveAttribute("cx", "150");
			expect(circle).toHaveAttribute("cy", "200");
			expect(circle).toHaveAttribute("r", "75");
		});

		it("should apply fill color to circle", () => {
			const shape: CircleShape = {
				id: "circle-3",
				type: "circle",
				x: 100,
				y: 100,
				radius: 50,
				fill: "#ffff00",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const circle = container.querySelector("circle");
			expect(circle).toHaveAttribute("fill", "#ffff00");
		});
	});

	describe("line shape", () => {
		it("should render a line shape", () => {
			const shape: LineShape = {
				id: "line-1",
				type: "line",
				x: 0,
				y: 0,
				x2: 100,
				y2: 100,
				stroke: "#000000",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const line = container.querySelector("line");
			expect(line).toBeInTheDocument();
		});

		it("should apply correct coordinates to line", () => {
			const shape: LineShape = {
				id: "line-2",
				type: "line",
				x: 50,
				y: 100,
				x2: 200,
				y2: 300,
				stroke: "#ff0000",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const line = container.querySelector("line");
			expect(line).toHaveAttribute("x1", "50");
			expect(line).toHaveAttribute("y1", "100");
			expect(line).toHaveAttribute("x2", "200");
			expect(line).toHaveAttribute("y2", "300");
		});

		it("should apply stroke color to line", () => {
			const shape: LineShape = {
				id: "line-3",
				type: "line",
				x: 0,
				y: 0,
				x2: 100,
				y2: 100,
				stroke: "#00ff00",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const line = container.querySelector("line");
			expect(line).toHaveAttribute("stroke", "#00ff00");
		});

		it("should apply stroke width to line when provided", () => {
			const shape: LineShape = {
				id: "line-4",
				type: "line",
				x: 0,
				y: 0,
				x2: 100,
				y2: 100,
				stroke: "#000000",
				strokeWidth: 5,
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const line = container.querySelector("line");
			expect(line).toHaveAttribute("stroke-width", "5");
		});

		it("should use default stroke width when not provided", () => {
			const shape: LineShape = {
				id: "line-5",
				type: "line",
				x: 0,
				y: 0,
				x2: 100,
				y2: 100,
				stroke: "#000000",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const line = container.querySelector("line");
			expect(line).toHaveAttribute("stroke-width", "2");
		});
	});

	describe("text shape", () => {
		it("should render a text shape", () => {
			const shape: TextShape = {
				id: "text-1",
				type: "text",
				x: 100,
				y: 100,
				text: "Hello World",
				fill: "#000000",
			};

			render(<ShapeRenderer shape={shape} />);

			expect(screen.getByText("Hello World")).toBeInTheDocument();
		});

		it("should apply correct position to text", () => {
			const shape: TextShape = {
				id: "text-2",
				type: "text",
				x: 150,
				y: 200,
				text: "Test Text",
				fill: "#000000",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const text = container.querySelector("text");
			expect(text).toHaveAttribute("x", "150");
			expect(text).toHaveAttribute("y", "200");
		});

		it("should apply fill color to text", () => {
			const shape: TextShape = {
				id: "text-3",
				type: "text",
				x: 100,
				y: 100,
				text: "Colored Text",
				fill: "#ff0000",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const text = container.querySelector("text");
			expect(text).toHaveAttribute("fill", "#ff0000");
		});

		it("should apply font size when provided", () => {
			const shape: TextShape = {
				id: "text-4",
				type: "text",
				x: 100,
				y: 100,
				text: "Big Text",
				fill: "#000000",
				fontSize: 24,
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const text = container.querySelector("text");
			expect(text).toHaveAttribute("font-size", "24");
		});

		it("should use default font size when not provided", () => {
			const shape: TextShape = {
				id: "text-5",
				type: "text",
				x: 100,
				y: 100,
				text: "Default Size",
				fill: "#000000",
			};

			const { container } = render(<ShapeRenderer shape={shape} />);

			const text = container.querySelector("text");
			expect(text).toHaveAttribute("font-size", "16");
		});
	});

	describe("interaction", () => {
		it("should call onClick when shape is clicked", () => {
			const shape: RectShape = {
				id: "rect-click",
				type: "rect",
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				fill: "#000000",
			};

			const onClick = vi.fn();

			const { container } = render(
				<ShapeRenderer shape={shape} onClick={onClick} />,
			);

			const rect = container.querySelector("rect");
			rect?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

			expect(onClick).toHaveBeenCalledWith(shape.id);
		});

		it("should add cursor pointer style when onClick is provided", () => {
			const shape: CircleShape = {
				id: "circle-click",
				type: "circle",
				x: 100,
				y: 100,
				radius: 50,
				fill: "#000000",
			};

			const { container } = render(
				<ShapeRenderer shape={shape} onClick={vi.fn()} />,
			);

			const circle = container.querySelector("circle");
			expect(circle).toHaveClass("cursor-pointer");
		});

		it("should apply selected style when isSelected is true", () => {
			const shape: RectShape = {
				id: "rect-selected",
				type: "rect",
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				fill: "#000000",
			};

			const { container } = render(
				<ShapeRenderer shape={shape} isSelected={true} />,
			);

			const rect = container.querySelector("rect");
			expect(rect).toHaveAttribute("stroke", "hsl(var(--primary))");
			expect(rect).toHaveAttribute("stroke-width", "2");
		});
	});
});
