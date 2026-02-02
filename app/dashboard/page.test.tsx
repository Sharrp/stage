import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from './page'

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
      single: vi.fn(() => Promise.resolve({
        data: null,
        error: { code: 'PGRST116' }
      })),
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

// Mock LogoutButton component
vi.mock('./LogoutButton', () => ({
  default: () => <button>Logout</button>,
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('When not authenticated', () => {
    it('redirects to homepage when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      try {
        await DashboardPage()
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

    it('renders dashboard when user is authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      expect(screen.getByText(/signed in as/i)).toBeInTheDocument()
    })

    it('displays user email', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    })

    it('displays user ID', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      expect(screen.getByText(/user id/i)).toBeInTheDocument()
      expect(screen.getByText(mockUser.id)).toBeInTheDocument()
    })

    it('shows signed in message', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      expect(screen.getByText(/signed in as/i)).toBeInTheDocument()
    })

    it('renders logout button', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })

    it('renders quack link', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      const link = screen.getByRole('link', { name: /wanna/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/quack')
    })
  })
})
