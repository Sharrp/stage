import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuackPage from './page'

// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Next.js redirect
const mockRedirect = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    mockRedirect(path)
    throw new Error(`NEXT_REDIRECT: ${path}`)
  },
}))

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}))

// Mock Supabase server client
const mockGetUser = vi.fn()
const mockFrom = vi.fn(() => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

// Mock QuackCounter component
vi.mock('@/components/QuackCounter', () => ({
  default: () => <div>QuackCounter</div>,
}))

describe('Quack Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('When not authenticated', () => {
    it('redirects to homepage when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      try {
        await QuackPage()
      } catch (error) {
        // redirect throws an error in Next.js
      }

      expect(mockRedirect).toHaveBeenCalledWith('/')
    })
  })

  describe('When authenticated', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
    }

    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    })

    it('renders quack page when user is authenticated', async () => {
      const result = await QuackPage()
      render(result)

      expect(screen.getByText('QuackCounter')).toBeInTheDocument()
    })

    it('renders QuackCounter component', async () => {
      const result = await QuackPage()
      render(result)

      expect(screen.getByText('QuackCounter')).toBeInTheDocument()
    })

    it('renders back to dashboard link', async () => {
      const result = await QuackPage()
      render(result)

      const link = screen.getByRole('link', { name: /back to dashboard/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/dashboard')
    })
  })
})
