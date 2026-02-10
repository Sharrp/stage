'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { generatedPlan } from '@/lib/mock-data'
import { PlanPhase } from '@/lib/types'

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
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      case 'user':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
      case 'collaborative':
        return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-8 py-6">
        <h1 className="text-3xl font-bold">Your Execution Plan</h1>
        <p className="text-sm text-slate-400 mt-2">
          {phases.length} phases, {totalTasks} tasks • Review and approve before we start
        </p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {phases.map((phase) => (
            <motion.div
              key={phase.id}
              className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Phase Header */}
              <button
                onClick={() => setExpanded(expanded === phase.id ? null : phase.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="text-2xl font-bold text-slate-500 w-8">{phases.indexOf(phase) + 1}</div>
                  <div>
                    <p className="font-semibold text-lg">{phase.name}</p>
                    <p className="text-sm text-slate-400">{phase.tasks.length} tasks • {phase.duration}</p>
                  </div>
                </div>
                <span className="text-slate-400">{expanded === phase.id ? '−' : '+'}</span>
              </button>

              {/* Phase Tasks */}
              {expanded === phase.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-slate-700 px-6 py-4 bg-slate-900/50 space-y-3"
                >
                  {phase.tasks.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-medium text-sm">{task.name}</p>
                        <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium ${getOwnerColor(task.owner)}`}>
                          {getOwnerLabel(task.owner)}
                        </span>
                      </div>
                      {task.gap && (
                        <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded px-3 py-2 flex items-start gap-2">
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
          <div className="mt-8 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-300">
              <strong>Estimated total time:</strong> 11-16 hours of system work. Your time at checkpoints: ~30-45 minutes.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8">
            <button
              onClick={() => goToScreen('checklist')}
              className="rounded-lg border border-slate-600 px-6 py-3 font-medium text-white hover:bg-slate-800 transition-all"
            >
              Back
            </button>
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
  )
}
