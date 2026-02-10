import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EscalationScreen } from './EscalationScreen'
import { useWorkflow } from '@/lib/context'

vi.mock('@/lib/context', () => ({
  useWorkflow: vi.fn(),
}))

const mockUseWorkflow = useWorkflow as ReturnType<typeof vi.fn>

describe('EscalationScreen', () => {
  beforeEach(() => {
    mockUseWorkflow.mockReturnValue({
      state: { screen: 'escalation' },
      goToScreen: vi.fn(),
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<EscalationScreen />)
    expect(container).toBeTruthy()
  })

  it('displays the escalation title', () => {
    render(<EscalationScreen />)
    expect(screen.getByText(/Missing Data Blocker/i)).toBeInTheDocument()
  })

  it('does not display mock data block', () => {
    render(<EscalationScreen />)
    expect(screen.queryByText(/💡 Mock Data/i)).not.toBeInTheDocument()
  })

  it('displays all three options', () => {
    render(<EscalationScreen />)
    expect(screen.getByText(/Use industry benchmark/i)).toBeInTheDocument()
    expect(screen.getByText(/I'll provide proxy data/i)).toBeInTheDocument()
    expect(screen.getByText(/Pause and gather data/i)).toBeInTheDocument()
  })
})
