import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://placeholder.supabase.co'
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.dummy'

  return createBrowserClient(url, key)
}

// Lazy singleton seguro para evitar quebras durante o build estático / SSR
let _browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserClient() {
  if (!_browserClient) {
    _browserClient = createClient()
  }
  return _browserClient
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = getBrowserClient()
    return (client as any)[prop]
  },
})

