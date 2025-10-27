import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CanvasToolbar } from "~/components/kibo-ui/canvas-toolbar";

/**
 * Testes para CanvasToolbar - Barra de ferramentas do canvas
 *
 * Testa funcionalidades de:
 * - Renderização da toolbar com todas as ferramentas
 * - Estilo glass morphism (shadcn/ui)
 * - Seleção de ferramentas
 * - Callback onToolSelect
 * - Estados visuais (selecionado/não selecionado)
 * - Acessibilidade
 */

describe("CanvasToolbar", () => {
	describe("rendering", () => {
		it("should render toolbar container with glass morphism styles", () => {
			const { container } = render(<CanvasToolbar />);

			const toolbar = container.firstChild as HTMLElement;
			expect(toolbar).toHaveClass("rounded-lg");
			expect(toolbar).toHaveClass("border");
			expect(toolbar).toHaveClass("bg-background/80");
			expect(toolbar).toHaveClass("shadow-lg");
			expect(toolbar).toHaveClass("backdrop-blur-sm");
		});

		it("should render all tool buttons", () => {
			render(<CanvasToolbar />);

			expect(screen.getByTitle("Rectangle")).toBeInTheDocument();
			expect(screen.getByTitle("Circle")).toBeInTheDocument();
			expect(screen.getByTitle("Text")).toBeInTheDocument();
			expect(screen.getByTitle("Line")).toBeInTheDocument();
		});

		it("should render buttons in vertical layout", () => {
			const { container } = render(<CanvasToolbar />);

			const toolbar = container.firstChild as HTMLElement;
			expect(toolbar).toHaveClass("flex");
			expect(toolbar).toHaveClass("flex-col");
			expect(toolbar).toHaveClass("gap-2");
		});

		it("should render buttons with correct size", () => {
			render(<CanvasToolbar />);

			const rectButton = screen.getByTitle("Rectangle");
			expect(rectButton).toHaveClass("h-8");
			expect(rectButton).toHaveClass("w-8");
		});
	});

	describe("tool selection", () => {
		it("should call onToolSelect when clicking a tool", () => {
			const handleToolSelect = vi.fn();
			render(<CanvasToolbar onToolSelect={handleToolSelect} />);

			const rectButton = screen.getByTitle("Rectangle");
			fireEvent.click(rectButton);

			expect(handleToolSelect).toHaveBeenCalledWith("rect");
		});

		it("should call onToolSelect with correct tool type for each button", () => {
			const handleToolSelect = vi.fn();
			render(<CanvasToolbar onToolSelect={handleToolSelect} />);

			fireEvent.click(screen.getByTitle("Rectangle"));
			expect(handleToolSelect).toHaveBeenCalledWith("rect");

			fireEvent.click(screen.getByTitle("Circle"));
			expect(handleToolSelect).toHaveBeenCalledWith("circle");

			fireEvent.click(screen.getByTitle("Text"));
			expect(handleToolSelect).toHaveBeenCalledWith("text");

			fireEvent.click(screen.getByTitle("Line"));
			expect(handleToolSelect).toHaveBeenCalledWith("line");
		});

		it("should highlight selected tool", () => {
			render(<CanvasToolbar selectedTool="circle" />);

			const circleButton = screen.getByTitle("Circle");
			const rectButton = screen.getByTitle("Rectangle");

			// Button selecionado deve ter variant default
			expect(circleButton).toHaveAttribute("data-state", "selected");
			// Button não selecionado deve ter variant ghost
			expect(rectButton).not.toHaveAttribute("data-state", "selected");
		});

		it("should update highlighted tool when selectedTool changes", () => {
			const { rerender } = render(<CanvasToolbar selectedTool="rect" />);

			let rectButton = screen.getByTitle("Rectangle");
			expect(rectButton).toHaveAttribute("data-state", "selected");

			rerender(<CanvasToolbar selectedTool="circle" />);

			const circleButton = screen.getByTitle("Circle");
			rectButton = screen.getByTitle("Rectangle");

			expect(circleButton).toHaveAttribute("data-state", "selected");
			expect(rectButton).not.toHaveAttribute("data-state", "selected");
		});
	});

	describe("accessibility", () => {
		it("should have descriptive title for each button", () => {
			render(<CanvasToolbar />);

			expect(screen.getByTitle("Rectangle")).toBeInTheDocument();
			expect(screen.getByTitle("Circle")).toBeInTheDocument();
			expect(screen.getByTitle("Text")).toBeInTheDocument();
			expect(screen.getByTitle("Line")).toBeInTheDocument();
		});

		it("should have role='toolbar'", () => {
			const { container } = render(<CanvasToolbar />);

			const toolbar = container.querySelector('[role="toolbar"]');
			expect(toolbar).toBeInTheDocument();
		});

		it("should have aria-label", () => {
			const { container } = render(<CanvasToolbar />);

			const toolbar = container.querySelector('[role="toolbar"]');
			expect(toolbar).toHaveAttribute("aria-label");
		});
	});

	describe("icons", () => {
		it("should render lucide-react icons with correct size", () => {
			const { container } = render(<CanvasToolbar />);

			const icons = container.querySelectorAll("svg");
			// 4 tool icons
			expect(icons.length).toBeGreaterThanOrEqual(4);

			// Check size of icons (h-4 w-4 = 16px)
			icons.forEach((icon) => {
				expect(icon).toHaveClass("h-4");
				expect(icon).toHaveClass("w-4");
			});
		});
	});

	describe("custom className", () => {
		it("should accept and apply custom className", () => {
			const { container } = render(<CanvasToolbar className="custom-class" />);

			const toolbar = container.firstChild as HTMLElement;
			expect(toolbar).toHaveClass("custom-class");
		});

		it("should merge custom className with default classes", () => {
			const { container } = render(<CanvasToolbar className="custom-class" />);

			const toolbar = container.firstChild as HTMLElement;
			expect(toolbar).toHaveClass("custom-class");
			expect(toolbar).toHaveClass("rounded-lg");
			expect(toolbar).toHaveClass("bg-background/80");
		});
	});
});
