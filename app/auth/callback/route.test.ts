import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextResponse, NextRequest } from 'next/server'

// Mock Supabase server client
const mockExchangeCodeForSession = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  }),
}))

describe('Auth Callback Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exchanges code for session when code is provided', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=test-code')
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-code')
  })

  it('redirects to dashboard on successful authentication', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=test-code')
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    expect(response.status).toBe(307) // Redirect status
    expect(response.headers.get('location')).toContain('/dashboard')
  })

  it('uses custom next parameter for redirect', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=test-code&next=/profile')
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    expect(response.headers.get('location')).toContain('/profile')
  })

  it('redirects to login with error when code exchange fails', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=test-code')
    mockExchangeCodeForSession.mockResolvedValue({ error: new Error('Exchange failed') })

    const response = await GET(request)

    expect(response.headers.get('location')).toContain('/login?error=auth_failed')
  })

  it('redirects to login with error when no code is provided', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback')

    const response = await GET(request)

    expect(response.headers.get('location')).toContain('/login?error=auth_failed')
  })

  it('preserves origin in redirect URL', async () => {
    const request = new NextRequest('https://example.com/auth/callback?code=test-code')
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    expect(response.headers.get('location')).toContain('https://example.com')
  })
})
