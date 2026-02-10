import { ChecklistItem, PlanPhase, Artifact } from './types'

export const checklistItems: ChecklistItem[] = [
  {
    id: 'customers',
    name: 'Customer list & segments',
    category: 'required',
    reason: 'Determine who pays what under each model',
    status: 'missing',
  },
  {
    id: 'revenue',
    name: 'Historical revenue & usage',
    category: 'required',
    reason: 'Calculate impact of model change',
    status: 'missing',
  },
  {
    id: 'churn',
    name: 'Churn & expansion data',
    category: 'required',
    reason: 'Estimate retention risk',
    status: 'missing',
  },
  {
    id: 'pricing',
    name: 'Current pricing & contracts',
    category: 'required',
    reason: 'Model existing commitments',
    status: 'missing',
  },
  {
    id: 'comp',
    name: 'Competitive pricing',
    category: 'nice-to-have',
    reason: 'Benchmark new prices',
    status: 'missing',
  },
  {
    id: 'interviews',
    name: 'Customer willingness interviews',
    category: 'nice-to-have',
    reason: 'Validate acceptance risk',
    status: 'missing',
  },
]

export const generatedPlan: PlanPhase[] = [
  {
    id: 'analysis',
    name: 'Situation Analysis',
    duration: '2-3 hours',
    tasks: [
      {
        id: 'gap-id',
        name: 'Identify data gaps',
        owner: 'system',
        completed: false,
      },
      {
        id: 'segment',
        name: 'Segment customer base',
        owner: 'system',
        completed: false,
        gap: 'No churn data → using industry proxy assumptions',
      },
      {
        id: 'baseline',
        name: 'Calculate current baseline',
        owner: 'system',
        completed: false,
      },
    ],
  },
  {
    id: 'options',
    name: 'Generate & Model Options',
    duration: '4-6 hours',
    tasks: [
      {
        id: 'options-gen',
        name: 'Create 3-5 pricing options',
        owner: 'system',
        completed: false,
      },
      {
        id: 'model',
        name: 'Model revenue impact per option',
        owner: 'system',
        completed: false,
      },
      {
        id: 'review',
        name: 'Review & select top 2 options',
        owner: 'collaborative',
        completed: false,
      },
    ],
  },
  {
    id: 'risk',
    name: 'Risk & Implementation Planning',
    duration: '3-4 hours',
    tasks: [
      {
        id: 'risk-id',
        name: 'Identify key risks (churn, ops, legal)',
        owner: 'system',
        completed: false,
      },
      {
        id: 'mitigation',
        name: 'Draft mitigation strategies',
        owner: 'system',
        completed: false,
      },
      {
        id: 'roadmap',
        name: 'Create implementation roadmap',
        owner: 'collaborative',
        completed: false,
      },
    ],
  },
  {
    id: 'package',
    name: 'Decision Package Assembly',
    duration: '2-3 hours',
    tasks: [
      {
        id: 'memo',
        name: 'Draft decision memo',
        owner: 'system',
        completed: false,
      },
      {
        id: 'faq',
        name: 'Create FAQ (internal & customer)',
        owner: 'system',
        completed: false,
      },
      {
        id: 'final-review',
        name: 'Final review & approval',
        owner: 'user',
        completed: false,
      },
    ],
  },
]

export const initialArtifacts: Artifact[] = [
  {
    id: 'memo',
    name: 'Decision Memo',
    type: 'memo',
    progress: 0,
    sections: [
      { name: 'Executive Summary', status: 'queued' },
      { name: 'Situation & Drivers', status: 'queued' },
      { name: 'Options Analyzed', status: 'queued' },
      { name: 'Recommendation', status: 'queued' },
      { name: 'Implementation Timeline', status: 'queued' },
    ],
    preview: '',
  },
  {
    id: 'model',
    name: 'Revenue Model',
    type: 'model',
    progress: 0,
    sections: [
      { name: 'Baseline Calculation', status: 'queued' },
      { name: 'Scenario Modeling', status: 'queued' },
      { name: 'Sensitivity Analysis', status: 'queued' },
    ],
    preview: '',
  },
  {
    id: 'faq',
    name: 'FAQ & Materials',
    type: 'faq',
    progress: 0,
    sections: [
      { name: 'Internal FAQ', status: 'queued' },
      { name: 'Customer FAQ', status: 'queued' },
      { name: 'Sales Talking Points', status: 'queued' },
    ],
    preview: '',
  },
  {
    id: 'roadmap',
    name: 'Implementation Roadmap',
    type: 'roadmap',
    progress: 0,
    sections: [
      { name: 'Phase 1: Planning', status: 'queued' },
      { name: 'Phase 2: Communication', status: 'queued' },
      { name: 'Phase 3: Execution', status: 'queued' },
    ],
    preview: '',
  },
]

export const driverDescriptions = {
  revenue: 'Growing top-line revenue and expanding addressable market',
  margin: 'Improving unit economics and operational profitability',
  competitive: 'Responding to market positioning and competitor moves',
  fairness: 'Aligning pricing with value delivered to customers',
}

export const involvementLevelDescriptions = {
  high: 'Review each phase, approve key decisions, stay deeply involved',
  checkpoint: 'Approve strategic choices at key decision points',
  executive: 'Review final package for approval only',
}
