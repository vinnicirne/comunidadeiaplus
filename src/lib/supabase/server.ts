import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  let cookieStore: any = null
  try {
    cookieStore = cookies()
  } catch {
    // Caso seja chamado fora de request context durante build estático
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://placeholder.supabase.co'
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.dummy'

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore ? cookieStore.getAll() : []
          } catch {
            return []
          }
        },
        setAll(cookiesToSet: any[]) {
          try {
            if (cookieStore) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            }
          } catch {
            // Server Component — cookies só podem ser definidos em Middleware ou Route Handler
          }
        },
      },
    }
  )
}

