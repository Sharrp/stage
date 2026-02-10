'use client'

import { useWorkflow } from '@/lib/context'
import { getPreviousScreen } from '@/lib/navigation'

export function BackButton() {
  const { state, goToScreen } = useWorkflow()
  const previousScreen = getPreviousScreen(state.screen)

  if (!previousScreen) return null

  return (
    <button
      onClick={() => goToScreen(previousScreen)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-medium text-sm"
    >
      ← Back
    </button>
  )
}
