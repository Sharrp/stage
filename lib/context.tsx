'use client'

import React, { createContext, useContext, useState } from 'react'
import { WorkflowState, ScreenType, IntakeData, ChecklistItem, PlanPhase, Artifact, ContextItem, WorkspaceState } from './types'

interface WorkflowContextType {
  state: WorkflowState
  goToScreen: (screen: ScreenType) => void
  setIntake: (data: IntakeData) => void
  setChecklist: (items: ChecklistItem[]) => void
  setPlan: (phases: PlanPhase[]) => void
  setArtifacts: (artifacts: Artifact[]) => void
  updateArtifact: (id: string, artifact: Partial<Artifact>) => void
  addContextItem: (item: ContextItem) => void
  removeContextItem: (id: string) => void
  setWorkspaceState: (state: WorkspaceState) => void
  updateWorkspaceState: (updates: Partial<WorkspaceState>) => void
  reset: () => void
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkflowState>({ screen: 'intake' })

  const goToScreen = (screen: ScreenType) => {
    setState((prev) => ({ ...prev, screen }))
  }

  const setIntake = (data: IntakeData) => {
    setState((prev) => ({ ...prev, intake: data }))
  }

  const setChecklist = (items: ChecklistItem[]) => {
    setState((prev) => ({ ...prev, checklist: items }))
  }

  const setPlan = (phases: PlanPhase[]) => {
    setState((prev) => ({ ...prev, plan: phases }))
  }

  const setArtifacts = (artifacts: Artifact[]) => {
    setState((prev) => ({ ...prev, artifacts }))
  }

  const updateArtifact = (id: string, artifact: Partial<Artifact>) => {
    setState((prev) => ({
      ...prev,
      artifacts: prev.artifacts?.map((a) => (a.id === id ? { ...a, ...artifact } : a)) || [],
    }))
  }

  const addContextItem = (item: ContextItem) => {
    setState((prev) => ({
      ...prev,
      contextItems: [...(prev.contextItems || []), item],
    }))
  }

  const removeContextItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      contextItems: prev.contextItems?.filter((item) => item.id !== id) || [],
    }))
  }

  const setWorkspaceState = (workspaceState: WorkspaceState) => {
    setState((prev) => ({
      ...prev,
      workspaceState,
    }))
  }

  const updateWorkspaceState = (updates: Partial<WorkspaceState>) => {
    setState((prev) => ({
      ...prev,
      workspaceState: {
        ...(prev.workspaceState || {
          currentPhase: 0,
          phaseProgress: 0,
          artifacts: [],
          escalationShown: false,
          escalationResolved: false,
          checkpointShown: false,
          checkpointResolved: false,
          isComplete: false,
        }),
        ...updates,
      },
    }))
  }

  const reset = () => {
    setState({ screen: 'intake' })
  }

  return (
    <WorkflowContext.Provider value={{ state, goToScreen, setIntake, setChecklist, setPlan, setArtifacts, updateArtifact, addContextItem, removeContextItem, setWorkspaceState, updateWorkspaceState, reset }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider')
  }
  return context
}
