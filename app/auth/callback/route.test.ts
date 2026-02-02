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

  it('uses x-forwarded-host header instead of request URL host', async () => {
    // This test prevents regression of the 0.0.0.0:8080 redirect issue
    // The request URL may contain 0.0.0.0 in containerized environments,
    // but forwarded headers should be used instead
    const request = new NextRequest('https://0.0.0.0:8080/auth/callback?code=test-code', {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'stage-app-988044283106.us-central1.run.app',
      },
    })
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    // Should redirect to the actual domain, not 0.0.0.0
    expect(response.headers.get('location')).toBe('https://stage-app-988044283106.us-central1.run.app/dashboard')
    expect(response.headers.get('location')).not.toContain('0.0.0.0')
  })

  it('falls back to host header when x-forwarded-host is missing', async () => {
    const request = new NextRequest('https://localhost:3000/auth/callback?code=test-code', {
      headers: {
        'x-forwarded-proto': 'https',
        'host': 'myapp.com',
      },
    })
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    expect(response.headers.get('location')).toBe('https://myapp.com/dashboard')
  })

  it('defaults to https when x-forwarded-proto header is missing', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=test-code', {
      headers: {
        'x-forwarded-host': 'example.com',
      },
    })
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    // Should use https by default even though request URL was http
    expect(response.headers.get('location')).toBe('https://example.com/dashboard')
  })

  it('prioritizes x-forwarded-host over all other sources', async () => {
    // This test ensures the fix for the Cloud Run redirect issue is maintained
    // Even if request.url and host header contain 0.0.0.0, x-forwarded-host takes priority
    const request = new NextRequest('https://0.0.0.0:8080/auth/callback?code=test-code', {
      headers: {
        'host': '0.0.0.0:8080',
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'myapp.example.com',
      },
    })
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const response = await GET(request)

    // Should use x-forwarded-host, not the request URL or host header
    expect(response.headers.get('location')).toBe('https://myapp.example.com/dashboard')
    expect(response.headers.get('location')).not.toContain('0.0.0.0')
  })
})
