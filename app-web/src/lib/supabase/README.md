# Supabase Clients

Clientes configurados para usar Supabase no Next.js 15 com App Router.

## 📦 Clients Disponíveis

### 1. Client Component (`client.ts`)

Use em componentes com `'use client'`:

```tsx
'use client'

import { createClient } from '~/lib/supabase/client'
import { useEffect, useState } from 'react'

export function MyClientComponent() {
  const [data, setData] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function getData() {
      const { data } = await supabase.from('posts').select()
      setData(data)
    }
    getData()
  }, [])

  return <div>{JSON.stringify(data)}</div>
}
```

### 2. Server Component (`server.ts`)

Use em Server Components, Server Actions e Route Handlers:

```tsx
// Server Component
import { createClient } from '~/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select()
    .order('createdAt', { ascending: false })

  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.name}</div>
      ))}
    </div>
  )
}
```

```tsx
// Server Action
'use server'

import { createClient } from '~/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  await supabase.from('posts').insert({
    name: formData.get('name') as string,
  })

  revalidatePath('/posts')
}
```

```tsx
// Route Handler (app/api/posts/route.ts)
import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('posts').select()

  return NextResponse.json(data)
}
```

## 🔐 Autenticação (Futuro)

Quando adicionarmos auth, os clients já estarão prontos:

```tsx
'use client'

import { createClient } from '~/lib/supabase/client'

export function LoginButton() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
  }

  return <button onClick={handleLogin}>Login com GitHub</button>
}
```

## 📝 Variáveis de Ambiente

Certifique-se de que estas variáveis estão no `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://hsrminmgtvyggjgnwjch.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

## 🚀 Diferenças entre os Clients

| Feature | Client Component | Server Component |
|---------|------------------|------------------|
| **Onde usar** | 'use client' | Server Components, Actions, API |
| **Cookies** | Browser handles | Server handles via Next.js |
| **Auth** | Client-side auth | Server-side auth |
| **Performance** | Runs in browser | Runs on server |
| **Revalidation** | Manual | `revalidatePath()` |

## 🧪 Testando a Conexão

```tsx
// app/test-supabase/page.tsx
import { createClient } from '~/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()

  // Testar query simples
  const { data, error } = await supabase.from('Post').select('count')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Supabase Connected! ✅</h1>
      <p>Posts count: {data?.[0]?.count ?? 0}</p>
    </div>
  )
}
```

## 📚 Documentação Oficial

- [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [SSR Package Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
