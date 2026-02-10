'use client'

import { useWorkflow } from '@/lib/context'

const steps = [
  { screen: 'intake', label: 'Problem Intake', number: 1 },
  { screen: 'checklist', label: 'Context Checklist', number: 2 },
  { screen: 'plan', label: 'Plan Review', number: 3 },
  { screen: 'workspace', label: 'Live Workspace', number: 4 },
  { screen: 'checkpoint', label: 'Checkpoint', number: 5 },
  { screen: 'escalation', label: 'Escalation', number: 6 },
  { screen: 'final', label: 'Final Package', number: 7 },
]

export function StepIndicator() {
  const { state, goToScreen } = useWorkflow()

  const currentStepIndex = steps.findIndex(s => s.screen === state.screen)
  const currentStep = steps[currentStepIndex]

  // Hide on reference modal (when it's the only screen accessible)
  if (!currentStep) return null

  return (
    <div className="flex items-center gap-4">
      {/* Step counter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">
          Step {currentStep.number} / {steps.length - 1}
        </span>
        <span className="text-xs text-gray-500">
          {currentStep.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="hidden sm:flex items-center gap-1">
        {steps.slice(0, -1).map((step, idx) => (
          <button
            key={step.screen}
            onClick={() => goToScreen(step.screen as any)}
            className={`h-2 transition-all ${
              idx < currentStepIndex
                ? 'bg-green-500 w-4'
                : idx === currentStepIndex
                ? 'bg-blue-600 w-6'
                : 'bg-gray-300 w-4'
            }`}
            title={step.label}
          />
        ))}
      </div>
    </div>
  )
}
