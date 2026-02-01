import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Home from './page'

// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockRedirect = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  redirect: (path: string) => {
    mockRedirect(path)
    throw new Error(`NEXT_REDIRECT: ${path}`) // Next.js redirect throws
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

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

// Mock Supabase browser client for GoogleLoginButton
const mockSignInWithOAuth = vi.fn()
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}))

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page without crashing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const jsx = await Home()
    render(jsx)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('displays "Under construction" heading', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const jsx = await Home()
    render(jsx)
    const heading = screen.getByRole('heading', { name: /under construction/i })
    expect(heading).toBeInTheDocument()
  })

  it('displays exact text "Under construction"', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const jsx = await Home()
    render(jsx)
    const heading = screen.getByRole('heading')
    expect(heading.textContent?.toLowerCase()).toBe('under construction')
  })

  it('applies correct styling classes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const jsx = await Home()
    render(jsx)
    const heading = screen.getByRole('heading', { name: /under construction/i })
    expect(heading).toHaveClass('uppercase')
  })

  it('has accessible heading structure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const jsx = await Home()
    render(jsx)
    const headings = screen.getAllByRole('heading')
    expect(headings).toHaveLength(1)
  })

  describe('Authentication - Not Logged In', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    })

    it('shows Google sign-in button when not authenticated', async () => {
      const jsx = await Home()
      render(jsx)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      })
    })

    it('Google sign-in button has correct styling', async () => {
      const jsx = await Home()
      render(jsx)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /sign in with google/i })
        expect(button).toHaveClass('bg-[#fb607f]')
        expect(button).toHaveClass('text-white')
      })
    })

    it('calls signInWithOAuth when Google button is clicked', async () => {
      const user = userEvent.setup()
      mockSignInWithOAuth.mockResolvedValue({ error: null })

      const jsx = await Home()
      render(jsx)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      })

      const button = screen.getByRole('button', { name: /sign in with google/i })
      await user.click(button)

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })

    it('disables button while signing in', async () => {
      const user = userEvent.setup()
      mockSignInWithOAuth.mockImplementation(() => new Promise(() => {})) // Never resolves

      const jsx = await Home()
      render(jsx)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      })

      const button = screen.getByRole('button', { name: /sign in with google/i })
      await user.click(button)

      await waitFor(() => {
        expect(button).toBeDisabled()
        expect(button).toHaveTextContent(/signing in/i)
      })
    })
  })

  describe('Authentication - Logged In', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
    }

    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      vi.clearAllMocks()
    })

    it('redirects to dashboard when user is authenticated', async () => {
      try {
        await Home()
      } catch (error: any) {
        // redirect() throws an error in Next.js
        expect(error.message).toContain('NEXT_REDIRECT')
      }
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })

    it('does not render page when authenticated', async () => {
      try {
        await Home()
      } catch (error: any) {
        // redirect() throws, so page doesn't render
        expect(error.message).toContain('NEXT_REDIRECT')
      }
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })
  })

})
