import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextResponse, NextRequest } from 'next/server'

// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}))

// Mock Supabase server client
const mockExchangeCodeForSession = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}))

describe('Auth Callback Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exchanges code for session when code is provided', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=test-code', {
      headers: {
        'x-forwarded-proto': 'http',
        'x-forwarded-host': 'localhost:3000',
      },
    })
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-code')
  })

  it('redirects to dashboard on successful authentication', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=test-code', {
      headers: {
        'x-forwarded-proto': 'http',
        'x-forwarded-host': 'localhost:3000',
      },
    })
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    expect(response.status).toBe(307) // Redirect status
    expect(response.headers.get('location')).toContain('/dashboard')
  })

  it('redirects to home with error when code exchange fails', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=test-code', {
      headers: {
        'x-forwarded-proto': 'http',
        'x-forwarded-host': 'localhost:3000',
      },
    })
    mockExchangeCodeForSession.mockResolvedValue({ error: new Error('Exchange failed') })

    const response = await GET(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/?error=auth_failed')
  })

  it('redirects to home with error when no code is provided', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback', {
      headers: {
        'x-forwarded-proto': 'http',
        'x-forwarded-host': 'localhost:3000',
      },
    })

    const response = await GET(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/?error=no_code')
  })

  it('uses request origin for redirect URL', async () => {
    const request = new NextRequest('http://example.com:3000/auth/callback?code=test-code', {
      headers: {
        'x-forwarded-proto': 'http',
        'x-forwarded-host': 'example.com:3000',
      },
    })
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    expect(response.headers.get('location')).toBe('http://example.com:3000/dashboard')
  })
})
