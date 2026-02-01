import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from './client'

// Mock @supabase/ssr
const mockCreateBrowserClient = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: (...args: any[]) => mockCreateBrowserClient(...args),
}))

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('creates a Supabase browser client', () => {
    const mockClient = { auth: {} }
    mockCreateBrowserClient.mockReturnValue(mockClient)

    const client = createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalled()
    expect(client).toBe(mockClient)
  })

  it('initializes with correct Supabase URL', () => {
    mockCreateBrowserClient.mockReturnValue({ auth: {} })

    createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
  })

  it('initializes with correct anon key', () => {
    mockCreateBrowserClient.mockReturnValue({ auth: {} })

    createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      expect.any(String),
      'test-anon-key'
    )
  })

  it('uses environment variables from process.env', () => {
    const testUrl = 'https://custom.supabase.co'
    const testKey = 'custom-key-123'

    process.env.NEXT_PUBLIC_SUPABASE_URL = testUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = testKey

    mockCreateBrowserClient.mockReturnValue({ auth: {} })

    createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(testUrl, testKey)
  })

  it('returns a client with auth methods', () => {
    const mockClient = {
      auth: {
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn(),
        onAuthStateChange: vi.fn(),
      },
    }

    mockCreateBrowserClient.mockReturnValue(mockClient)

    const client = createClient()

    expect(client.auth).toBeDefined()
    expect(client.auth.signInWithOAuth).toBeDefined()
    expect(client.auth.signOut).toBeDefined()
    expect(client.auth.getUser).toBeDefined()
    expect(client.auth.onAuthStateChange).toBeDefined()
  })
})
