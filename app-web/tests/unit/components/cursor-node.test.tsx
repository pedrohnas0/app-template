import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { CursorNode, type CursorData } from "~/components/kibo-ui/cursor-node";
import type { NodeProps } from "@xyflow/react";

/**
 * Testes do CursorNode Component
 *
 * Objetivo: Renderizar cursores colaborativos como React Flow Nodes
 * com tamanho fixo (compensação de zoom).
 *
 * Baseado em: Plan 02 - Refatoração de Cursores
 * Padrão: tldraw (presence store) + Figma (scale compensation)
 *
 * Nota: Testes de zoom compensation são validados manualmente
 * devido à complexidade de mockar React Flow store.
 */

// Mock do useStore retornando zoom padrão
vi.mock("@xyflow/react", async () => {
	const actual = await vi.importActual("@xyflow/react");
	return {
		...actual,
		useStore: vi.fn((selector: any) => {
			const state = {
				transform: [0, 0, 1], // [x, y, zoom=1]
				nodeInternals: new Map(),
				edges: [],
				width: 1000,
				height: 800,
			};
			return selector(state);
		}),
	};
});

describe("CursorNode", () => {
	const mockData: CursorData = {
		id: "user-1",
		name: "Pedro",
		avatar: "https://github.com/pedrohnas0.png",
		color: "blue",
		isCurrentUser: false,
	};

	const createNodeProps = (data: CursorData = mockData): any => ({
		id: `cursor-${data.id}`,
		type: "cursorNode",
		data,
		selected: false,
		isConnectable: false,
		zIndex: 9999,
		dragging: false,
		positionAbsoluteX: 100,
		positionAbsoluteY: 200,
	});

	const renderCursorNode = (data = mockData) => {
		return render(
			<ReactFlowProvider>
				<CursorNode {...createNodeProps(data)} />
			</ReactFlowProvider>,
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering Básico", () => {
		it("should render cursor with user name", () => {
			renderCursorNode();
			expect(screen.getByText("Pedro")).toBeInTheDocument();
		});

		it("should render cursor with user avatar", () => {
			renderCursorNode();

			const avatar = screen.getByAltText("Pedro");
			expect(avatar).toBeInTheDocument();
		});

		it("should apply pointer-events-none class", () => {
			renderCursorNode();

			const container = screen.getByTestId("cursor-user-1");
			expect(container).toHaveClass("pointer-events-none");
		});

		it("should have data-testid with user id", () => {
			renderCursorNode();
			expect(screen.getByTestId("cursor-user-1")).toBeInTheDocument();
		});
	});

	describe("Current User (não renderizar próprio cursor)", () => {
		it("should NOT render when isCurrentUser is true", () => {
			renderCursorNode({ ...mockData, isCurrentUser: true });
			expect(screen.queryByText("Pedro")).not.toBeInTheDocument();
		});

		it("should render when isCurrentUser is false", () => {
			renderCursorNode({ ...mockData, isCurrentUser: false });
			expect(screen.getByText("Pedro")).toBeInTheDocument();
		});

		it("should render when isCurrentUser is undefined", () => {
			const dataWithoutFlag = { ...mockData };
			delete (dataWithoutFlag as any).isCurrentUser;

			renderCursorNode(dataWithoutFlag);
			expect(screen.getByText("Pedro")).toBeInTheDocument();
		});
	});

	describe("Fixed Size Scaling (manual validation)", () => {
		it("should apply transform style for zoom compensation", () => {
			renderCursorNode();

			const container = screen.getByTestId("cursor-user-1");

			// Verifica que style contém transform
			expect(container).toHaveStyle({ transformOrigin: "top left" });
		});

		it("should NOT have transition on scale (instant zoom)", () => {
			renderCursorNode();

			const container = screen.getByTestId("cursor-user-1");

			// ✅ Sem transição - scale deve ser instantâneo durante zoom
			// Não deve ter inline transition style
			expect(container.style.transition).toBe("");
		});
	});

	describe("Color Themes", () => {
		it("should apply blue color theme", () => {
			renderCursorNode({ ...mockData, color: "blue" });

			const container = screen.getByTestId("cursor-user-1");
			expect(container.innerHTML).toContain("text-blue-600");
		});

		it("should apply emerald color theme", () => {
			renderCursorNode({ ...mockData, color: "emerald" });

			const container = screen.getByTestId("cursor-user-1");
			expect(container.innerHTML).toContain("text-emerald-600");
		});

		it("should apply rose color theme", () => {
			renderCursorNode({ ...mockData, color: "rose" });

			const container = screen.getByTestId("cursor-user-1");
			expect(container.innerHTML).toContain("text-rose-600");
		});

		it("should apply violet color theme", () => {
			renderCursorNode({ ...mockData, color: "violet" });

			const container = screen.getByTestId("cursor-user-1");
			expect(container.innerHTML).toContain("text-violet-600");
		});

		it("should apply background color matching foreground", () => {
			renderCursorNode({ ...mockData, color: "blue" });

			const container = screen.getByTestId("cursor-user-1");
			expect(container.innerHTML).toContain("bg-blue-100");
		});
	});

	describe("Cursor Chat (mensagem opcional)", () => {
		it("should render message when provided", () => {
			renderCursorNode({ ...mockData, message: "Hello!" });
			expect(screen.getByText("Hello!")).toBeInTheDocument();
		});

		it("should NOT render message when not provided", () => {
			renderCursorNode({ ...mockData, message: undefined });
			expect(screen.queryByText(/Hello/i)).not.toBeInTheDocument();
		});

		it("should render multiline message", () => {
			const multiline = "Line 1\nLine 2\nLine 3";
			renderCursorNode({ ...mockData, message: multiline });
			// Texto multiline é renderizado, mas pode aparecer com ou sem \n
			expect(screen.getByText(/Line 1.*Line 2.*Line 3/s)).toBeInTheDocument();
		});
	});

	describe("Accessibility & Best Practices", () => {
		it("should have proper alt text for avatar", () => {
			renderCursorNode();

			const avatar = screen.getByAltText("Pedro");
			expect(avatar).toHaveAttribute("alt", "Pedro");
		});

		it("should render avatar with correct dimensions", () => {
			renderCursorNode();

			const avatar = screen.getByAltText("Pedro") as HTMLImageElement;
			expect(avatar).toHaveAttribute("width", "16");
			expect(avatar).toHaveAttribute("height", "16");
		});
	});

	describe("Edge Cases", () => {
		it("should handle missing avatar gracefully", () => {
			const dataWithoutAvatar = { ...mockData, avatar: "" };
			renderCursorNode(dataWithoutAvatar);
			expect(screen.getByText("Pedro")).toBeInTheDocument();
		});

		it("should handle very long names", () => {
			const longName = "A".repeat(100);
			renderCursorNode({ ...mockData, name: longName });
			expect(screen.getByText(longName)).toBeInTheDocument();
		});

		it("should handle special characters in name", () => {
			const specialName = "João 🇧🇷";
			renderCursorNode({ ...mockData, name: specialName });
			expect(screen.getByText(specialName)).toBeInTheDocument();
		});
	});

	describe("Component Structure", () => {
		it("should render Cursor wrapper", () => {
			renderCursorNode();

			const container = screen.getByTestId("cursor-user-1");
			expect(container.querySelector('[class*="flex"]')).toBeInTheDocument();
		});

		it("should render CursorPointer", () => {
			renderCursorNode();

			// CursorPointer é SVG
			const container = screen.getByTestId("cursor-user-1");
			expect(container.querySelector('svg')).toBeInTheDocument();
		});

		it("should render CursorBody with user info", () => {
			renderCursorNode();

			// Verifica estrutura: avatar + name
			expect(screen.getByAltText("Pedro")).toBeInTheDocument();
			expect(screen.getByText("Pedro")).toBeInTheDocument();
		});
	});
});
