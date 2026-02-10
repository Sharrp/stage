'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { generatedPlan } from '@/lib/mock-data'
import { PlanPhase } from '@/lib/types'
import { StepIndicator } from '../StepIndicator'
import { BackButton } from '../BackButton'

export function PlanScreen() {
  const { goToScreen, setPlan } = useWorkflow()
  const [phases, setPhases] = useState<PlanPhase[]>(generatedPlan)
  const [expanded, setExpanded] = useState<string | null>('analysis')

  const handleApprove = () => {
    setPlan(phases)
    goToScreen('workspace')
  }

  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0)

  const getOwnerColor = (owner: string) => {
    switch (owner) {
      case 'system':
        return 'bg-purple-100 text-purple-900 border border-purple-300'
      case 'user':
        return 'bg-blue-100 text-blue-900 border border-blue-300'
      case 'collaborative':
        return 'bg-indigo-100 text-indigo-900 border border-indigo-300'
    }
  }

  const getOwnerLabel = (owner: string) => {
    switch (owner) {
      case 'system':
        return '[SYSTEM]'
      case 'user':
        return '[USER]'
      case 'collaborative':
        return '[COLLABORATIVE]'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your Execution Plan</h1>
            <p className="text-sm text-gray-600 mt-2">
              {phases.length} phases, {totalTasks} tasks • Review and approve before we start
            </p>
          </div>
          <StepIndicator />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-100px)]">
        {/* Sidebar with Mock Data */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 p-6">
          <div className="sticky top-8 rounded-lg border-2 border-gray-200 bg-white p-6">
            <h3 className="text-sm font-bold uppercase text-gray-600 mb-4">💡 Mock Data</h3>
            <p className="text-xs text-gray-600 mb-3">
              This execution plan is pre-populated based on your inputs.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-8 py-12 overflow-y-auto">
          <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {phases.map((phase) => (
            <motion.div
              key={phase.id}
              className="rounded-lg border border-gray-300 bg-white overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Phase Header */}
              <button
                onClick={() => setExpanded(expanded === phase.id ? null : phase.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="text-2xl font-bold text-gray-500 w-8">{phases.indexOf(phase) + 1}</div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900">{phase.name}</p>
                    <p className="text-sm text-gray-600">{phase.tasks.length} tasks • {phase.duration}</p>
                  </div>
                </div>
                <span className="text-gray-600">{expanded === phase.id ? '−' : '+'}</span>
              </button>

              {/* Phase Tasks */}
              {expanded === phase.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 px-6 py-4 bg-gray-50 space-y-3"
                >
                  {phase.tasks.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-medium text-sm text-gray-900">{task.name}</p>
                        <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium ${getOwnerColor(task.owner)}`}>
                          {getOwnerLabel(task.owner)}
                        </span>
                      </div>
                      {task.gap && (
                        <div className="text-xs text-orange-800 bg-orange-50 border border-orange-300 rounded px-3 py-2 flex items-start gap-2">
                          <span className="mt-0.5">⚠</span>
                          <span>{task.gap}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Info Card */}
          <div className="mt-8 rounded-lg border border-blue-300 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>Estimated total time:</strong> 11-16 hours of system work. Your time at checkpoints: ~30-45 minutes.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8">
            <BackButton />
            <button
              onClick={handleApprove}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Approve Plan & Start
            </button>
          </div>
        </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
