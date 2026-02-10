import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlanScreen } from './PlanScreen'
import { useWorkflow } from '@/lib/context'

vi.mock('@/lib/context', () => ({
  useWorkflow: vi.fn(),
}))

const mockUseWorkflow = useWorkflow as ReturnType<typeof vi.fn>

describe('PlanScreen', () => {
  beforeEach(() => {
    mockUseWorkflow.mockReturnValue({
      state: { screen: 'plan' },
      goToScreen: vi.fn(),
      setPlan: vi.fn(),
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<PlanScreen />)
    expect(container).toBeTruthy()
  })

  it('displays the plan header', () => {
    render(<PlanScreen />)
    expect(screen.getByText(/Your Execution Plan/i)).toBeInTheDocument()
  })

  it('does not display mock data block', () => {
    render(<PlanScreen />)
    // Mock data block should not exist on PlanScreen
    expect(screen.queryByText(/💡 Mock Data/i)).not.toBeInTheDocument()
  })

  it('displays phase information', () => {
    render(<PlanScreen />)
    // Should show phases section - check for the header text which includes both
    expect(screen.getByText(/phases, \d+ tasks/i)).toBeInTheDocument()
  })

  it('displays approve plan button', () => {
    render(<PlanScreen />)
    expect(screen.getByRole('button', { name: /Approve Plan & Start/i })).toBeInTheDocument()
  })
})
