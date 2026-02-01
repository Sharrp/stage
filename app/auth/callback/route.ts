import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('DEBUG - request.url:', request.url)
  console.log('DEBUG - request.nextUrl.origin:', request.nextUrl.origin)
  console.log('DEBUG - request.headers.host:', request.headers.get('host'))
  console.log('DEBUG - request.headers.x-forwarded-host:', request.headers.get('x-forwarded-host'))
  console.log('DEBUG - request.headers.x-forwarded-proto:', request.headers.get('x-forwarded-proto'))

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
  const origin = `${proto}://${host}`
  console.log('DEBUG - constructed origin:', origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
