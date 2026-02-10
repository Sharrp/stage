import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkspaceScreen } from './WorkspaceScreen'
import { useWorkflow } from '@/lib/context'

vi.mock('@/lib/context', () => ({
  useWorkflow: vi.fn(),
}))

const mockUseWorkflow = useWorkflow as ReturnType<typeof vi.fn>

describe('WorkspaceScreen', () => {
  beforeEach(() => {
    mockUseWorkflow.mockReturnValue({
      state: { screen: 'workspace' },
      goToScreen: vi.fn(),
      setArtifacts: vi.fn(),
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<WorkspaceScreen />)
    expect(container).toBeTruthy()
  })

  it('displays the workspace header', () => {
    render(<WorkspaceScreen />)
    expect(screen.getByRole('heading', { level: 1, name: /Workspace/i })).toBeInTheDocument()
  })

  it('does not display mock data block', () => {
    render(<WorkspaceScreen />)
    // Mock data block should not exist on WorkspaceScreen
    expect(screen.queryByText(/💡 Mock Data/i)).not.toBeInTheDocument()
  })

  it('displays execution plan section', () => {
    render(<WorkspaceScreen />)
    expect(screen.getByText(/Execution Plan/i)).toBeInTheDocument()
  })

  it('displays live artifacts section', () => {
    render(<WorkspaceScreen />)
    expect(screen.getByText(/Live Artifacts/i)).toBeInTheDocument()
  })

  it('displays current activity section', () => {
    render(<WorkspaceScreen />)
    expect(screen.getByText(/Currently Working On/i)).toBeInTheDocument()
  })
})
