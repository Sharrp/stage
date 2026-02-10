import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChecklistScreen } from './ChecklistScreen'
import { useWorkflow } from '@/lib/context'
import { checklistItems as initialItems } from '@/lib/mock-data'

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

  it('displays mock data block in right sidebar', () => {
    render(<ChecklistScreen />)
    expect(screen.getByText(/💡 Mock Data/i)).toBeInTheDocument()
  })

  it('displays fill buttons in mock data block', () => {
    render(<ChecklistScreen />)
    expect(screen.getByRole('button', { name: /Fill required/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fill all files/i })).toBeInTheDocument()
  })

  it('displays required and nice-to-have sections', () => {
    render(<ChecklistScreen />)
    expect(screen.getByRole('heading', { level: 2, name: /Required Data/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Nice-to-Have Data/i })).toBeInTheDocument()
  })

  it('fills all required items when clicking "Fill required" button', async () => {
    const user = userEvent.setup()
    render(<ChecklistScreen />)

    const requiredItems = initialItems.filter(i => i.category === 'required')
    const requiredCount = requiredItems.length

    // Initially, required items should show as missing (○)
    const missingIcons = screen.getAllByText('○')
    expect(missingIcons.length).toBeGreaterThanOrEqual(requiredCount)

    // Click fill required button
    const fillRequiredBtn = screen.getByRole('button', { name: /Fill required/i })
    await user.click(fillRequiredBtn)

    // All required items should now show as uploaded (✓)
    const uploadedIcons = screen.getAllByText('✓')
    expect(uploadedIcons.length).toBeGreaterThanOrEqual(requiredCount)
  })

  it('fills all items when clicking "Fill all files" button', async () => {
    const user = userEvent.setup()
    render(<ChecklistScreen />)

    const allItemsCount = initialItems.length

    // Click fill all files button
    const fillAllBtn = screen.getByRole('button', { name: /Fill all files/i })
    await user.click(fillAllBtn)

    // All items should now show as uploaded (✓)
    const uploadedIcons = screen.getAllByText('✓')
    expect(uploadedIcons.length).toBe(allItemsCount)
  })
})
