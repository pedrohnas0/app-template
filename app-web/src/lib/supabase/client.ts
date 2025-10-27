import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase Client for Client Components
 *
 * Use this in Client Components (components with 'use client' directive)
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { createClient } from '~/lib/supabase/client'
 *
 * export function MyComponent() {
 *   const supabase = createClient()
 *
 *   // Use supabase client
 *   const { data } = await supabase.from('posts').select()
 * }
 * ```
 */
export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
