import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Home from './page'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock Supabase client
const mockSignInWithOAuth = vi.fn()
const mockGetUser = vi.fn()
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page without crashing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    render(<Home />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('displays "Under construction" heading', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /under construction/i })
    expect(heading).toBeInTheDocument()
  })

  it('displays exact text "Under construction"', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    render(<Home />)
    const heading = screen.getByRole('heading')
    expect(heading.textContent?.toLowerCase()).toBe('under construction')
  })

  it('applies correct styling classes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /under construction/i })
    expect(heading).toHaveClass('uppercase')
  })

  it('has accessible heading structure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    render(<Home />)
    const headings = screen.getAllByRole('heading')
    expect(headings).toHaveLength(1)
  })

  describe('Authentication - Not Logged In', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    })

    it('shows Google sign-in button when not authenticated', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      })
    })

    it('Google sign-in button has correct styling', async () => {
      render(<Home />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /sign in with google/i })
        expect(button).toHaveClass('bg-[#fb607f]')
        expect(button).toHaveClass('text-white')
      })
    })

    it('calls signInWithOAuth when Google button is clicked', async () => {
      const user = userEvent.setup()
      mockSignInWithOAuth.mockResolvedValue({ error: null })

      render(<Home />)

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

      render(<Home />)

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
    })

    it('redirects to dashboard when user is authenticated', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('does not show Google sign-in button when authenticated', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })

      expect(screen.queryByRole('button', { name: /sign in with google/i })).not.toBeInTheDocument()
    })
  })

  describe('Auth State Changes', () => {
    it('sets up auth state listener on mount', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      render(<Home />)

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })
    })

    it('redirects to dashboard when user logs in', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const mockUnsubscribe = vi.fn()
      const authCallback = vi.fn()

      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback.mockImplementation(callback)
        return {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }
      })

      render(<Home />)

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })

      // Simulate user login
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      }

      authCallback('SIGNED_IN', { user: mockUser })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })
})
