export type ScreenType =
  | 'intake'
  | 'checklist'
  | 'plan'
  | 'workspace'
  | 'checkpoint'
  | 'escalation'
  | 'final'
  | 'reference'

export interface IntakeData {
  situation: string
  driver: 'revenue' | 'margin' | 'competitive' | 'fairness'
  involvementLevel: 'high' | 'checkpoint' | 'executive'
}

export interface ChecklistItem {
  id: string
  name: string
  category: 'required' | 'nice-to-have'
  reason: string
  status: 'missing' | 'uploaded' | 'blocked'
  file?: File
}

export interface PlanPhase {
  id: string
  name: string
  duration: string
  tasks: PlanTask[]
}

export interface PlanTask {
  id: string
  name: string
  owner: 'system' | 'user' | 'collaborative'
  completed: boolean
  gap?: string
}

export interface Artifact {
  id: string
  name: string
  type: 'memo' | 'model' | 'faq' | 'roadmap' | 'decision-log' | 'assumptions'
  progress: number
  sections: { name: string; status: 'done' | 'in-progress' | 'queued' }[]
  preview: string
}

export interface ContextItem {
  id: string
  type: 'text' | 'image' | 'document' | 'link'
  label: string
  content?: string
  file?: File
  url?: string
  addedAt: number
}

export interface WorkspaceState {
  currentPhase: number
  phaseProgress: number
  artifacts: Artifact[]
  escalationShown: boolean
  escalationResolved: boolean
  checkpointShown: boolean
  checkpointResolved: boolean
  isComplete: boolean
}

export interface WorkflowState {
  screen: ScreenType
  intake?: IntakeData
  checklist?: ChecklistItem[]
  plan?: PlanPhase[]
  artifacts?: Artifact[]
  currentPhase?: string
  checkpointData?: unknown
  contextItems?: ContextItem[]
  workspaceState?: WorkspaceState
}

export interface CheckpointPrompt {
  id: string
  title: string
  context: string
  question: string
  options: { id: string; label: string; description: string }[]
  impact: string
  dataUsed: string[]
  confidence: number
}
