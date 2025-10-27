import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase Client for Server Components
 *
 * Use this in Server Components, Server Actions, and Route Handlers
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClient } from '~/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('posts').select()
 *
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Server Action
 * 'use server'
 *
 * import { createClient } from '~/lib/supabase/server'
 *
 * export async function createPost(formData: FormData) {
 *   const supabase = await createClient()
 *   await supabase.from('posts').insert({ name: formData.get('name') })
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
