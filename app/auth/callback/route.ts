import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Get the correct origin from forwarded headers (for Cloud Run/proxy environments)
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || requestUrl.host
  const origin = `${protocol}://${host}`

  // Debug logging to diagnose redirect issue
  console.log('=== AUTH CALLBACK DEBUG ===')
  console.log('request.url:', request.url)
  console.log('requestUrl.origin:', requestUrl.origin)
  console.log('Constructed origin:', origin)
  console.log('  from x-forwarded-proto:', request.headers.get('x-forwarded-proto'))
  console.log('  from x-forwarded-host:', request.headers.get('x-forwarded-host'))
  console.log('===========================')

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=no_code`)
  }

  // Create the redirect response first
  const redirectResponse = NextResponse.redirect(`${origin}/dashboard`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Set on both request and response
          request.cookies.set({ name, value, ...options })
          redirectResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          // Remove from both request and response
          request.cookies.set({ name, value: '', ...options })
          redirectResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Error exchanging code for session:', error)
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  return redirectResponse
}
