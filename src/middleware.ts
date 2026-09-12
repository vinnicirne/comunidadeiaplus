import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase ENV vars missing in Middleware. Bypassing auth.')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          } catch (error) {
            // Se falhar ao definir cookies (ex: ambiente edge estrito), ignoramos no middleware
          }
        },
      },
    }
  )

  // Atualiza a sessão do usuário (SEMPRE deve ser feito)
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Middleware Supabase Auth Error:', error)
  }

  const pathname = request.nextUrl.pathname

  // Rotas que exigem autenticação
  const protectedRoutes = ['/criar-topico', '/configuracoes', '/perfil-editar']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Rotas exclusivas de admin
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if ((isProtectedRoute || isAdminRoute) && !user) {
    // Redireciona para login com parâmetro de retorno
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute && user) {
    // Verifica se o usuário é admin (consulta rápida ao perfil)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
       console.error('Middleware Supabase Admin Check Error:', error)
       return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
