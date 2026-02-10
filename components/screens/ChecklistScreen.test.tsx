import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChecklistScreen } from './ChecklistScreen'
import { useWorkflow } from '@/lib/context'

vi.mock('@/lib/context', () => ({
  useWorkflow: vi.fn(),
}))

const mockUseWorkflow = useWorkflow as ReturnType<typeof vi.fn>

describe('ChecklistScreen', () => {
  beforeEach(() => {
    mockUseWorkflow.mockReturnValue({
      state: { screen: 'checklist' },
      goToScreen: vi.fn(),
      setChecklist: vi.fn(),
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<ChecklistScreen />)
    expect(container).toBeTruthy()
  })

  it('displays the checklist header', () => {
    render(<ChecklistScreen />)
    expect(screen.getByText(/What data do you have\?/i)).toBeInTheDocument()
  })

  it('does not display mock data block', () => {
    render(<ChecklistScreen />)
    expect(screen.queryByText(/💡 Mock Data/i)).not.toBeInTheDocument()
  })

  it('does not display fill with sample files button', () => {
    render(<ChecklistScreen />)
    expect(screen.queryByText(/Fill with sample files/i)).not.toBeInTheDocument()
  })

  it('displays required and nice-to-have sections', () => {
    render(<ChecklistScreen />)
    expect(screen.getByRole('heading', { level: 2, name: /Required Data/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Nice-to-Have Data/i })).toBeInTheDocument()
  })
})
