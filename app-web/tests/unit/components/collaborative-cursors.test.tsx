import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CollaborativeCursors } from "~/components/kibo-ui/collaborative-cursors";

/**
 * Testes para CollaborativeCursors - Cursores colaborativos em tempo real
 *
 * Testa funcionalidades de:
 * - Renderização de múltiplos cursores
 * - Posicionamento absoluto com percentagens
 * - Cores rotativas (blue, emerald, rose, violet)
 * - Transições suaves
 * - Exibição de nome e avatar
 * - Mensagens opcionais
 * - Data attributes para testes
 */

/**
 * Tipos de teste
 */
type TestUser = {
	id: string;
	name: string;
	avatar: string;
	x: number;
	y: number;
	message?: string;
	isCurrentUser?: boolean;
};

describe("CollaborativeCursors", () => {
	describe("rendering", () => {
		it("should render empty state when no users provided", () => {
			const { container } = render(<CollaborativeCursors users={[]} />);

			const cursors = container.querySelectorAll('[data-testid^="cursor-"]');
			expect(cursors.length).toBe(0);
		});

		it("should render a single cursor", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/johndoe.png",
					x: 50,
					y: 50,
				},
			];

			render(<CollaborativeCursors users={users} />);

			expect(screen.getByTestId("cursor-user-1")).toBeInTheDocument();
			expect(screen.getByText("John Doe")).toBeInTheDocument();
		});

		it("should render multiple cursors", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/johndoe.png",
					x: 10,
					y: 20,
				},
				{
					id: "user-2",
					name: "Jane Smith",
					avatar: "https://github.com/janesmith.png",
					x: 30,
					y: 40,
				},
				{
					id: "user-3",
					name: "Bob Wilson",
					avatar: "https://github.com/bobwilson.png",
					x: 60,
					y: 70,
				},
			];

			render(<CollaborativeCursors users={users} />);

			expect(screen.getByTestId("cursor-user-1")).toBeInTheDocument();
			expect(screen.getByTestId("cursor-user-2")).toBeInTheDocument();
			expect(screen.getByTestId("cursor-user-3")).toBeInTheDocument();
		});
	});

	describe("positioning", () => {
		it("should position cursor using percentage coordinates", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/johndoe.png",
					x: 25,
					y: 75,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			expect(cursor).toHaveStyle({
				top: "75%",
				left: "25%",
			});
		});

		it("should apply absolute positioning", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/johndoe.png",
					x: 50,
					y: 50,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			expect(cursor).toHaveClass("absolute");
		});

		it("should apply pointer-events-none to cursors", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/johndoe.png",
					x: 50,
					y: 50,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			expect(cursor).toHaveClass("pointer-events-none");
		});
	});

	describe("transitions", () => {
		it("should apply no transition to current user cursor", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "Current User",
					avatar: "https://github.com/currentuser.png",
					x: 50,
					y: 50,
					isCurrentUser: true,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			expect(cursor).toHaveClass("transition-none");
		});

		it("should apply smooth transition to other users", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "Other User",
					avatar: "https://github.com/otheruser.png",
					x: 50,
					y: 50,
					isCurrentUser: false,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			expect(cursor).toHaveClass("transition-all");
			expect(cursor).toHaveClass("duration-1000");
		});

		it("should default to smooth transition when isCurrentUser not specified", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "User",
					avatar: "https://github.com/user.png",
					x: 50,
					y: 50,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			expect(cursor).toHaveClass("transition-all");
			expect(cursor).toHaveClass("duration-1000");
		});
	});

	describe("colors", () => {
		it("should apply blue color to first user (index 0)", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "User 1",
					avatar: "https://github.com/user1.png",
					x: 10,
					y: 10,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			// Blue color classes
			expect(cursor?.innerHTML).toContain("text-blue-600");
			expect(cursor?.innerHTML).toContain("bg-blue-100");
		});

		it("should apply emerald color to second user (index 1)", () => {
			const users: TestUser[] = [
				{ id: "user-1", name: "User 1", avatar: "https://github.com/user1.png", x: 10, y: 10 },
				{ id: "user-2", name: "User 2", avatar: "https://github.com/user2.png", x: 20, y: 20 },
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-2"]');
			// Emerald color classes
			expect(cursor?.innerHTML).toContain("text-emerald-600");
			expect(cursor?.innerHTML).toContain("bg-emerald-100");
		});

		it("should apply rose color to third user (index 2)", () => {
			const users: TestUser[] = [
				{ id: "user-1", name: "User 1", avatar: "https://github.com/user1.png", x: 10, y: 10 },
				{ id: "user-2", name: "User 2", avatar: "https://github.com/user2.png", x: 20, y: 20 },
				{ id: "user-3", name: "User 3", avatar: "https://github.com/user3.png", x: 30, y: 30 },
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-3"]');
			// Rose color classes
			expect(cursor?.innerHTML).toContain("text-rose-600");
			expect(cursor?.innerHTML).toContain("bg-rose-100");
		});

		it("should apply violet color to fourth user (index 3)", () => {
			const users: TestUser[] = [
				{ id: "user-1", name: "User 1", avatar: "https://github.com/user1.png", x: 10, y: 10 },
				{ id: "user-2", name: "User 2", avatar: "https://github.com/user2.png", x: 20, y: 20 },
				{ id: "user-3", name: "User 3", avatar: "https://github.com/user3.png", x: 30, y: 30 },
				{ id: "user-4", name: "User 4", avatar: "https://github.com/user4.png", x: 40, y: 40 },
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-4"]');
			// Violet color classes
			expect(cursor?.innerHTML).toContain("text-violet-600");
			expect(cursor?.innerHTML).toContain("bg-violet-100");
		});

		it("should cycle colors for more than 4 users", () => {
			const users: TestUser[] = [
				{ id: "user-1", name: "User 1", avatar: "https://github.com/user1.png", x: 10, y: 10 },
				{ id: "user-2", name: "User 2", avatar: "https://github.com/user2.png", x: 20, y: 20 },
				{ id: "user-3", name: "User 3", avatar: "https://github.com/user3.png", x: 30, y: 30 },
				{ id: "user-4", name: "User 4", avatar: "https://github.com/user4.png", x: 40, y: 40 },
				{ id: "user-5", name: "User 5", avatar: "https://github.com/user5.png", x: 50, y: 50 },
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			// Fifth user should get blue again (index 4 % 4 = 0)
			const cursor = container.querySelector('[data-testid="cursor-user-5"]');
			expect(cursor?.innerHTML).toContain("text-blue-600");
			expect(cursor?.innerHTML).toContain("bg-blue-100");
		});
	});

	describe("user information", () => {
		it("should display user name", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "Pedro Nascimento",
					avatar: "https://github.com/pedro.png",
					x: 50,
					y: 50,
				},
			];

			render(<CollaborativeCursors users={users} />);

			expect(screen.getByText("Pedro Nascimento")).toBeInTheDocument();
		});

		it("should display user avatar", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "Pedro Nascimento",
					avatar: "https://github.com/pedro.png",
					x: 50,
					y: 50,
				},
			];

			render(<CollaborativeCursors users={users} />);

			const avatar = screen.getByAltText("Pedro Nascimento");
			expect(avatar).toBeInTheDocument();
			expect(avatar).toHaveAttribute("src", "https://github.com/pedro.png");
		});

		it("should display user message when provided", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/john.png",
					x: 50,
					y: 50,
					message: "Can we adjust the color?",
				},
			];

			render(<CollaborativeCursors users={users} />);

			expect(screen.getByText("Can we adjust the color?")).toBeInTheDocument();
		});

		it("should not display message when not provided", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/john.png",
					x: 50,
					y: 50,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			// Verificar que não há mensagem renderizada
			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			const cursorText = cursor?.textContent || "";
			// Deve conter apenas o nome, não mensagem extra
			expect(cursorText).toBe("John Doe");
		});
	});

	describe("cursor components", () => {
		it("should render cursor pointer (SVG)", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/john.png",
					x: 50,
					y: 50,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
			expect(svg).toHaveClass("size-6");
		});

		it("should render cursor body with styles", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/john.png",
					x: 50,
					y: 50,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			// Verificar estilos do cursor body (glass morphism)
			expect(cursor?.innerHTML).toContain("border");
			expect(cursor?.innerHTML).toContain("shadow-md");
			expect(cursor?.innerHTML).toContain("px-3");
			expect(cursor?.innerHTML).toContain("py-2");
		});

		it("should render avatar with correct size", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "John Doe",
					avatar: "https://github.com/john.png",
					x: 50,
					y: 50,
				},
			];

			render(<CollaborativeCursors users={users} />);

			const avatar = screen.getByAltText("John Doe");
			// Avatar deve ter classes size-4 (16px)
			expect(avatar).toHaveClass("size-4");
			expect(avatar).toHaveClass("rounded-full");
		});
	});

	describe("edge cases", () => {
		it("should handle users with same position", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "User 1",
					avatar: "https://github.com/user1.png",
					x: 50,
					y: 50,
				},
				{
					id: "user-2",
					name: "User 2",
					avatar: "https://github.com/user2.png",
					x: 50,
					y: 50,
				},
			];

			render(<CollaborativeCursors users={users} />);

			// Ambos devem ser renderizados
			expect(screen.getByTestId("cursor-user-1")).toBeInTheDocument();
			expect(screen.getByTestId("cursor-user-2")).toBeInTheDocument();
		});

		it("should handle extreme coordinates (0, 0)", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "User",
					avatar: "https://github.com/user.png",
					x: 0,
					y: 0,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			expect(cursor).toHaveStyle({
				top: "0%",
				left: "0%",
			});
		});

		it("should handle extreme coordinates (100, 100)", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "User",
					avatar: "https://github.com/user.png",
					x: 100,
					y: 100,
				},
			];

			const { container } = render(<CollaborativeCursors users={users} />);

			const cursor = container.querySelector('[data-testid="cursor-user-1"]');
			expect(cursor).toHaveStyle({
				top: "100%",
				left: "100%",
			});
		});
	});

	describe("custom className", () => {
		it("should accept custom className for container", () => {
			const users: TestUser[] = [
				{
					id: "user-1",
					name: "User",
					avatar: "https://github.com/user.png",
					x: 50,
					y: 50,
				},
			];

			const { container } = render(
				<CollaborativeCursors users={users} className="custom-cursors" />
			);

			// O container pode ter uma classe customizada aplicada
			expect(container.firstChild).toHaveClass("custom-cursors");
		});
	});
});
