import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReactFlowProvider } from "@xyflow/react";
import { ShapeNode } from "~/components/kibo-ui/shape-node";
import type { NodeProps } from "@xyflow/react";
import type { ShapeNodeData } from "~/components/kibo-ui/shape-node";

/**
 * Wrapper com ReactFlowProvider para testes
 */
function renderWithProvider(ui: React.ReactElement) {
	return render(<ReactFlowProvider>{ui}</ReactFlowProvider>);
}

describe("ShapeNode", () => {
	const createNodeProps = (
		shape: ShapeNodeData["shape"],
		selected = false,
	): any => ({
		id: "test-node",
		data: { shape },
		selected,
		type: "shapeNode",
		// Mock required props from React Flow
		dragging: false,
		isConnectable: true,
		zIndex: 0,
	});

	describe("Rectangle Shape", () => {
		it("should render rectangle with correct styles", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "rect-1",
				type: "rect",
				x: 100,
				y: 100,
				width: 200,
				height: 150,
				fill: "#ff0000",
			};

			renderWithProvider(<ShapeNode {...createNodeProps(shape)} />);

			const rect = screen.getByTestId("shape-rect-1");
			expect(rect).toBeInTheDocument();
			expect(rect).toHaveStyle({
				width: "200px",
				height: "150px",
				backgroundColor: "#ff0000",
			});
		});

		it("should show selected state", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "rect-2",
				type: "rect",
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				fill: "#000000",
			};

			renderWithProvider(
				<ShapeNode {...createNodeProps(shape, true)} />,
			);

			const rect = screen.getByTestId("shape-rect-2");
			expect(rect).toHaveClass("ring-2");
			expect(rect).toHaveClass("ring-primary");
		});
	});

	describe("Circle Shape", () => {
		it("should render circle with correct styles", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "circle-1",
				type: "circle",
				x: 50,
				y: 50,
				radius: 30,
				fill: "#00ff00",
			};

			renderWithProvider(<ShapeNode {...createNodeProps(shape)} />);

			const circle = screen.getByTestId("shape-circle-1");
			expect(circle).toBeInTheDocument();
			expect(circle).toHaveClass("rounded-full");
			expect(circle).toHaveStyle({
				width: "60px",
				height: "60px",
				backgroundColor: "#00ff00",
			});
		});
	});

	describe("Text Shape", () => {
		it("should render text with correct content", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "text-1",
				type: "text",
				x: 10,
				y: 10,
				text: "Hello World",
				fill: "#0000ff",
				fontSize: 24,
			};

			renderWithProvider(<ShapeNode {...createNodeProps(shape)} />);

			expect(screen.getByText("Hello World")).toBeInTheDocument();
		});

		it("should apply custom font size", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "text-2",
				type: "text",
				x: 0,
				y: 0,
				text: "Test",
				fill: "#000000",
				fontSize: 32,
			};

			renderWithProvider(<ShapeNode {...createNodeProps(shape)} />);

			const text = screen.getByTestId("shape-text-2");
			expect(text).toHaveStyle({ fontSize: "32px" });
		});

		it("should use default font size when not specified", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "text-3",
				type: "text",
				x: 0,
				y: 0,
				text: "Default",
				fill: "#000000",
			};

			renderWithProvider(<ShapeNode {...createNodeProps(shape)} />);

			const text = screen.getByTestId("shape-text-3");
			expect(text).toHaveStyle({ fontSize: "16px" });
		});
	});

	describe("Line Shape", () => {
		it("should render line with correct width", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "line-1",
				type: "line",
				x: 0,
				y: 0,
				x2: 100,
				y2: 0,
				stroke: "#ff00ff",
				strokeWidth: 4,
			};

			renderWithProvider(<ShapeNode {...createNodeProps(shape)} />);

			const line = screen.getByTestId("shape-line-1");
			expect(line).toBeInTheDocument();
			expect(line).toHaveStyle({
				height: "4px",
				backgroundColor: "#ff00ff",
			});
		});

		it("should use default stroke width", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "line-2",
				type: "line",
				x: 0,
				y: 0,
				x2: 50,
				y2: 50,
				stroke: "#000000",
			};

			renderWithProvider(<ShapeNode {...createNodeProps(shape)} />);

			const line = screen.getByTestId("shape-line-2");
			expect(line).toHaveStyle({ height: "2px" });
		});
	});

	describe("Handles", () => {
		it("should render invisible handles", () => {
			const shape: ShapeNodeData["shape"] = {
				id: "rect-1",
				type: "rect",
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				fill: "#000000",
			};

			const { container } = renderWithProvider(
				<ShapeNode {...createNodeProps(shape)} />,
			);

			const handles = container.querySelectorAll(".opacity-0");
			expect(handles.length).toBeGreaterThanOrEqual(2); // target + source
		});
	});
});
