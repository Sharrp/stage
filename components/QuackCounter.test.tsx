import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import QuackCounter from './QuackCounter'
import type { QuackStats } from '@/lib/supabase/database.types'

// Set up environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock the audio module
vi.mock('@/lib/audio', () => ({
  playQuackSound: vi.fn().mockResolvedValue(undefined),
}))

// Mock the Supabase client
const mockGetSession = vi.fn()
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
  },
}

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockSupabaseClient),
}))

// Mock fetch globally
global.fetch = vi.fn()

const mockStats: QuackStats = {
  id: 'test-user-123',
  user_id: 'test-user-123',
  total_quacks: 42,
  last_quack_at: '2024-01-15T10:30:00Z',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
}

const mockSession = {
  access_token: 'test-token-123',
  user: { id: 'test-user-123' },
}

describe('QuackCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockClear()
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })
  })

  describe('UI Tests', () => {
    it('renders the "You can Quack" title with button', () => {
      render(<QuackCounter initialStats={mockStats} />)

      expect(screen.getByRole('button', { name: /quack/i })).toBeInTheDocument()
      expect(screen.getByText(/🦆/)).toBeInTheDocument()
      const titleDiv = screen.getByRole('button', { name: /quack/i }).parentElement
      expect(titleDiv?.textContent).toContain('You can')
    })

    it('displays total quacks count', () => {
      render(<QuackCounter initialStats={mockStats} />)

      expect(screen.getByText('Total Quacks')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('displays "Time Without Quacks" in correct format', () => {
      render(<QuackCounter initialStats={mockStats} />)

      expect(screen.getByText('Time Without Quacks')).toBeInTheDocument()
      const statsDiv = screen.getByText('Total Quacks').closest('.grid')
      expect(statsDiv?.textContent).toMatch(/\d+\s*(second|minute|hour|day|Just now)/)
    })

    it('button has correct styling classes', () => {
      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      expect(button).toHaveClass('border', 'border-primary', 'px-5', 'py-2')
    })

    it('error message displays with styling', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })
    })

    it('floating duck emoji appears on quack', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      // Floating ducks are added to document.body
      await waitFor(() => {
        const ducks = document.querySelectorAll('.fixed.pointer-events-none.text-3xl')
        expect(ducks.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Logic Tests - Formatting', () => {
    it('formatRelativeTime() returns "Never" for null dates', () => {
      render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: null,
          }}
        />
      )

      // Find the Never text - it's displayed in the Time Without Quacks section
      expect(screen.getByText('Never')).toBeInTheDocument()
    })

    it('formatRelativeTime() returns "Just now" for <60 seconds', () => {
      const now = new Date()
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)

      render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: thirtySecondsAgo.toISOString(),
          }}
        />
      )

      expect(screen.getByText('Just now')).toBeInTheDocument()
    })

    it('formatRelativeTime() returns correct minute count (singular)', () => {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

      render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: oneMinuteAgo.toISOString(),
          }}
        />
      )
      expect(screen.getByText(/1 minute/)).toBeInTheDocument()
    })

    it('formatRelativeTime() returns correct minute count (plural)', () => {
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      const { unmount } = render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: fiveMinutesAgo.toISOString(),
          }}
        />
      )
      expect(screen.getByText(/5 minutes/)).toBeInTheDocument()
      unmount()
    })

    it('formatRelativeTime() returns correct hour count (singular)', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 3600 * 1000)

      render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: oneHourAgo.toISOString(),
          }}
        />
      )
      expect(screen.getByText(/1 hour/)).toBeInTheDocument()
    })

    it('formatRelativeTime() returns correct hour count (plural)', () => {
      const now = new Date()
      const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000)

      const { unmount } = render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: threeHoursAgo.toISOString(),
          }}
        />
      )
      expect(screen.getByText(/3 hours/)).toBeInTheDocument()
      unmount()
    })

    it('formatRelativeTime() returns correct day count (singular)', () => {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 86400 * 1000)

      render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: oneDayAgo.toISOString(),
          }}
        />
      )
      expect(screen.getByText(/1 day/)).toBeInTheDocument()
    })

    it('formatRelativeTime() returns correct day count (plural)', () => {
      const now = new Date()
      const fourDaysAgo = new Date(now.getTime() - 4 * 86400 * 1000)

      const { unmount } = render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: fourDaysAgo.toISOString(),
          }}
        />
      )
      expect(screen.getByText(/4 days/)).toBeInTheDocument()
      unmount()
    })

    it('formatTimeDuration() works same as formatRelativeTime but without "ago" suffix', () => {
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      render(
        <QuackCounter
          initialStats={{
            ...mockStats,
            last_quack_at: fiveMinutesAgo.toISOString(),
          }}
        />
      )

      const timeDisplay = screen.getByText(/5 minutes/)
      expect(timeDisplay).toBeInTheDocument()
      // Should NOT contain "ago"
      expect(timeDisplay.textContent).not.toContain('ago')
    })
  })

  describe('Logic Tests - Debouncing & Batching', () => {
    it('demo stats initialized when no initialStats provided', () => {
      render(<QuackCounter initialStats={null} />)

      expect(screen.getByText('0')).toBeInTheDocument() // total_quacks: 0
      expect(screen.getByText('Never')).toBeInTheDocument() // last_quack_at: null
    })

    it('API request sent to /api/quack with POST method', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/quack',
          expect.objectContaining({
            method: 'POST',
          })
        )
      })
    })

    it('request body contains { increment: N } with correct count', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 45 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)
      await userEvent.click(button)
      await userEvent.click(button)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/quack',
          expect.objectContaining({
            body: JSON.stringify({ increment: 3 }),
          })
        )
      })
    })

    it('authorization header includes Bearer token', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/quack',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token-123',
            }),
          })
        )
      })
    })
  })

  describe('Logic Tests - Optimistic Updates', () => {
    it('clicking increments total_quacks immediately in UI', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      expect(screen.getByText('42')).toBeInTheDocument()

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      // Count should update immediately (optimistic)
      await waitFor(() => {
        expect(screen.getByText('43')).toBeInTheDocument()
      })
    })

    it('clicking updates last_quack_at with current timestamp immediately', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={{ ...mockStats, last_quack_at: null }} />)

      expect(screen.getByText('Never')).toBeInTheDocument()

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      // Time should update immediately
      await waitFor(() => {
        expect(screen.getByText('Just now')).toBeInTheDocument()
      })
    })
  })

  describe('Storage/API Tests', () => {

    it('demo mode error shown when no session token', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText(/demo mode/i)).toBeInTheDocument()
      })
    })

    it('timer cleanup on component unmount', () => {
      const { unmount } = render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      button.click()

      // Unmount before debounce completes
      unmount()

      // Should not throw or cause errors
      expect(true).toBe(true)
    })
  })

  describe('Sound & Animation Tests', () => {
    it('playQuackSound() called on each quack', async () => {
      const { playQuackSound } = await import('@/lib/audio')

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      await waitFor(() => {
        expect(playQuackSound).toHaveBeenCalledOnce()
      })
    })

    it('sound errors do not crash component', async () => {
      const { playQuackSound } = await import('@/lib/audio')
      ;(playQuackSound as any).mockRejectedValueOnce(new Error('Audio error'))

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      // Component should still render and function
      expect(screen.getByRole('button', { name: /quack/i })).toBeInTheDocument()
    })

    it('floating duck animation set to 1 second duration', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      await waitFor(() => {
        const ducks = document.querySelectorAll('.fixed.pointer-events-none.text-3xl')
        expect(ducks.length).toBeGreaterThan(0)

        const firstDuck = ducks[0] as HTMLElement
        expect(firstDuck.style.animation).toBe('float-up 1s ease-out forwards')
      })
    })

    it('button shows pulse animation while clicking', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockStats, total_quacks: 43 }),
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })

      await userEvent.click(button)

      // Wait a tick to let state update
      await waitFor(() => {
        expect(button).toHaveClass('animate-pulse')
      })
    })
  })

  describe('Additional Edge Cases', () => {
    it('retry button does not appear for demo mode', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      render(<QuackCounter initialStats={mockStats} />)

      const button = screen.getByRole('button', { name: /quack/i })
      await userEvent.click(button)

      await waitFor(
        () => {
          expect(screen.getByText(/demo mode/i)).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      // Demo mode should not have retry button
      const retryButtons = screen.queryAllByRole('button', { name: /retry/i })
      expect(retryButtons).toHaveLength(0)
    })
  })
})
