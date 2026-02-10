import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CheckpointScreen } from './CheckpointScreen'
import { useWorkflow } from '@/lib/context'

vi.mock('@/lib/context', () => ({
  useWorkflow: vi.fn(),
}))

const mockUseWorkflow = useWorkflow as ReturnType<typeof vi.fn>

describe('CheckpointScreen', () => {
  beforeEach(() => {
    mockUseWorkflow.mockReturnValue({
      state: { screen: 'checkpoint' },
      goToScreen: vi.fn(),
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<CheckpointScreen />)
    expect(container).toBeTruthy()
  })

  it('displays the checkpoint question', () => {
    render(<CheckpointScreen />)
    expect(screen.getByText(/unwilling to lose/i)).toBeInTheDocument()
  })

  it('does not display mock data block', () => {
    render(<CheckpointScreen />)
    expect(screen.queryByText(/💡 Mock Data/i)).not.toBeInTheDocument()
  })

  it('renders the three segment options', () => {
    render(<CheckpointScreen />)
    expect(screen.getByText(/Enterprise customers/i)).toBeInTheDocument()
    expect(screen.getByText(/Mid-market/i)).toBeInTheDocument()
    expect(screen.getByText(/Startup\/growth segment/i)).toBeInTheDocument()
  })
})
