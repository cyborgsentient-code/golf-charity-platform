import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: any }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Protect routes — redirect to login if not authenticated
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/onboarding') || pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/onboarding/:path*', '/profile/:path*', '/profile'],
}
