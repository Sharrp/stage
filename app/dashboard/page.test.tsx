import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from './page'

// Mock Next.js redirect
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}))

// Mock Supabase server client
const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

// Mock LogoutButton component
vi.mock('./LogoutButton', () => ({
  default: () => <button>Logout</button>,
}))

describe('Dashboard Page', () => {
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

      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
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

      expect(screen.getByText(mockUser.id)).toBeInTheDocument()
    })

    it('shows welcome message', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      expect(screen.getByText(/welcome/i)).toBeInTheDocument()
      expect(screen.getByText(/you are logged in as/i)).toBeInTheDocument()
    })

    it('renders logout button', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })

    it('has correct styling classes', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await DashboardPage()
      render(result)

      const heading = screen.getByRole('heading', { name: /dashboard/i })
      expect(heading).toHaveClass('text-[#fb607f]')
    })
  })
})
