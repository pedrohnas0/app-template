import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	type RenderOptions,
	render as rtlRender,
} from "@testing-library/react";
import { httpBatchLink } from "@trpc/client";
import type { ReactElement, ReactNode } from "react";
import superjson from "superjson";
import { api } from "~/trpc/react";

/**
 * Custom render para testes com providers
 *
 * Wrapper que fornece todos os providers necessários para testar componentes:
 * - QueryClientProvider (React Query)
 * - tRPC Provider
 *
 * @example
 * ```tsx
 * import { render, screen } from 'tests/helpers/render'
 *
 * test('renders component', () => {
 *   render(<MyComponent />)
 *   expect(screen.getByText('Hello')).toBeInTheDocument()
 * })
 * ```
 */

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	/**
	 * URL do servidor tRPC para testes
	 * @default 'http://localhost:3000'
	 */
	trpcUrl?: string;
}

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

export function render(ui: ReactElement, options: CustomRenderOptions = {}) {
	const { trpcUrl = "http://localhost:3000", ...renderOptions } = options;

	const queryClient = createTestQueryClient();

	const trpcClient = api.createClient({
		links: [
			httpBatchLink({
				url: `${trpcUrl}/api/trpc`,
				transformer: superjson,
			}),
		],
	});

	function Wrapper({ children }: { children: ReactNode }) {
		return (
			<api.Provider client={trpcClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</api.Provider>
		);
	}

	return {
		...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
		queryClient,
		trpcClient,
	};
}

// Re-export tudo do Testing Library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
