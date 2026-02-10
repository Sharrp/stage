import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FinalScreen } from './FinalScreen'
import { useWorkflow } from '@/lib/context'

vi.mock('@/lib/context', () => ({
  useWorkflow: vi.fn(),
}))

const mockUseWorkflow = useWorkflow as ReturnType<typeof vi.fn>

describe('FinalScreen', () => {
  beforeEach(() => {
    mockUseWorkflow.mockReturnValue({
      state: { screen: 'final' },
      goToScreen: vi.fn(),
      reset: vi.fn(),
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<FinalScreen />)
    expect(container).toBeTruthy()
  })

  it('displays the completion header', () => {
    render(<FinalScreen />)
    expect(screen.getByText(/Decision Package Complete/i)).toBeInTheDocument()
  })

  it('does not display mock data block', () => {
    render(<FinalScreen />)
    expect(screen.queryByText(/💡 Mock Data/i)).not.toBeInTheDocument()
  })

  it('displays deliverables section', () => {
    render(<FinalScreen />)
    expect(screen.getByRole('heading', { level: 2, name: /Deliverables/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Decision Memo/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Revenue Model \(Excel\)/i)).toBeInTheDocument()
  })

  it('displays meta-documents section', () => {
    render(<FinalScreen />)
    expect(screen.getByText(/Included in All Downloads/i)).toBeInTheDocument()
  })
})
