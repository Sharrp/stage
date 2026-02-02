import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // Debug logging to diagnose redirect issue
  console.log('=== AUTH CALLBACK DEBUG ===')
  console.log('request.url:', request.url)
  console.log('requestUrl.origin:', requestUrl.origin)
  console.log('requestUrl.protocol:', requestUrl.protocol)
  console.log('requestUrl.host:', requestUrl.host)
  console.log('requestUrl.hostname:', requestUrl.hostname)
  console.log('requestUrl.port:', requestUrl.port)
  console.log('')
  console.log('Headers:')
  console.log('  host:', request.headers.get('host'))
  console.log('  x-forwarded-host:', request.headers.get('x-forwarded-host'))
  console.log('  x-forwarded-proto:', request.headers.get('x-forwarded-proto'))
  console.log('  x-forwarded-for:', request.headers.get('x-forwarded-for'))
  console.log('  x-real-ip:', request.headers.get('x-real-ip'))
  console.log('  forwarded:', request.headers.get('forwarded'))
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
