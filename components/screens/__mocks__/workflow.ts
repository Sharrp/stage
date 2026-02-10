import { vi } from 'vitest'

export const mockUseWorkflow = () => ({
  state: { screen: 'checkpoint' as const },
  goToScreen: vi.fn(),
  setIntake: vi.fn(),
  setChecklist: vi.fn(),
  setPlan: vi.fn(),
  setArtifacts: vi.fn(),
  updateArtifact: vi.fn(),
  reset: vi.fn(),
})
