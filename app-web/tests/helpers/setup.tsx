import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

// Setup MSW
beforeAll(() => {
	// Start MSW server before all tests
	server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
	// Cleanup React Testing Library
	cleanup();

	// Reset MSW handlers after each test
	server.resetHandlers();
});

afterAll(() => {
	// Stop MSW server after all tests
	server.close();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		pathname: "/",
		query: {},
		asPath: "/",
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
	default: (props: any) => {
		// eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
		return <img {...props} />;
	},
}));

// Suppress console errors in tests (optional)
global.console = {
	...console,
	error: vi.fn(),
	warn: vi.fn(),
};
