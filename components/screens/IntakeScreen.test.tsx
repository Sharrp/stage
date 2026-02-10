import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntakeScreen } from './IntakeScreen'
import { useWorkflow } from '@/lib/context'

vi.mock('@/lib/context', () => ({
  useWorkflow: vi.fn(),
}))

const mockUseWorkflow = useWorkflow as ReturnType<typeof vi.fn>

describe('IntakeScreen', () => {
  beforeEach(() => {
    mockUseWorkflow.mockReturnValue({
      state: { screen: 'intake' },
      goToScreen: vi.fn(),
      setIntake: vi.fn(),
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<IntakeScreen />)
    expect(container).toBeTruthy()
  })

  it('displays the intake header', () => {
    render(<IntakeScreen />)
    expect(screen.getByText(/Humbly waiting/i)).toBeInTheDocument()
  })

  it('displays mock data block in right sidebar', () => {
    render(<IntakeScreen />)
    expect(screen.getByText(/💡 Mock Data/i)).toBeInTheDocument()
  })

  it('displays situation textarea', () => {
    render(<IntakeScreen />)
    expect(screen.getByPlaceholderText(/currently charge per seat/i)).toBeInTheDocument()
  })

  it('fills situation field when clicking mock data button', async () => {
    const user = userEvent.setup()
    render(<IntakeScreen />)

    const textarea = screen.getByPlaceholderText(/currently charge per seat/i) as HTMLTextAreaElement
    expect(textarea.value).toBe('')

    // Click fill example situation button
    const fillBtn = screen.getByRole('button', { name: /Fill example situation/i })
    await user.click(fillBtn)

    // Textarea should now contain the example situation
    expect(textarea.value).toContain('usage-based')
  })

  it('displays driver selection after filling situation', async () => {
    const user = userEvent.setup()
    render(<IntakeScreen />)

    const fillBtn = screen.getByRole('button', { name: /Fill example situation/i })
    await user.click(fillBtn)

    // Driver selection should be visible
    expect(screen.getByText(/What's the primary driver/i)).toBeInTheDocument()
  })

  it('displays involvement level selection after filling situation', async () => {
    const user = userEvent.setup()
    render(<IntakeScreen />)

    const fillBtn = screen.getByRole('button', { name: /Fill example situation/i })
    await user.click(fillBtn)

    // Involvement level selection should be visible
    expect(screen.getByText(/How hands-on do you want to be/i)).toBeInTheDocument()
  })
})
