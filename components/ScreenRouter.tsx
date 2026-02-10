'use client'

import { useWorkflow } from '@/lib/context'
import { IntakeScreen } from './screens/IntakeScreen'
import { ChecklistScreen } from './screens/ChecklistScreen'
import { PlanScreen } from './screens/PlanScreen'
import { WorkspaceScreen } from './screens/WorkspaceScreen'
import { CheckpointScreen } from './screens/CheckpointScreen'
import { EscalationScreen } from './screens/EscalationScreen'
import { FinalScreen } from './screens/FinalScreen'
import { RoleReference } from './RoleReference'

export function ScreenRouter() {
  const { state } = useWorkflow()

  return (
    <>
      {state.screen === 'intake' && <IntakeScreen />}
      {state.screen === 'checklist' && <ChecklistScreen />}
      {state.screen === 'plan' && <PlanScreen />}
      {state.screen === 'workspace' && <WorkspaceScreen />}
      {state.screen === 'checkpoint' && <CheckpointScreen />}
      {state.screen === 'escalation' && <EscalationScreen />}
      {state.screen === 'final' && <FinalScreen />}

      {state.screen !== 'intake' && <RoleReference />}
    </>
  )
}
