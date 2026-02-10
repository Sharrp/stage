'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { initialArtifacts, generatedPlan } from '@/lib/mock-data'
import { Artifact, PlanPhase } from '@/lib/types'

export function WorkspaceScreen() {
  const { goToScreen, setArtifacts } = useWorkflow()
  const [artifacts, setLocalArtifacts] = useState<Artifact[]>(initialArtifacts)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [expandedArtifact, setExpandedArtifact] = useState<string | null>(null)

  // Simulate progress (3x faster)
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseProgress((p) => {
        if (p >= 95) {
          // Move to next phase or complete
          setCurrentPhase((cp) => {
            if (cp >= generatedPlan.length - 1) {
              return cp // Stay at last phase
            }
            return cp + 1
          })
          return 0
        }
        return p + Math.random() * 75
      })

      // Simulate artifact progress
      setLocalArtifacts((arts) =>
        arts.map((art) => {
          const newProgress = Math.min(100, art.progress + Math.random() * 45)
          const sectionsWithProgress = art.sections.map((section) => {
            if (section.status === 'done') return section
            if (Math.random() > 0.7 && section.status === 'in-progress') {
              return { ...section, status: 'done' as const }
            }
            if (Math.random() > 0.8 && section.status === 'queued') {
              return { ...section, status: 'in-progress' as const }
            }
            return section
          })
          return { ...art, progress: newProgress, sections: sectionsWithProgress }
        })
      )
    }, 300)

    return () => clearInterval(interval)
  }, [])

  const handleCheckpoint = () => {
    goToScreen('checkpoint')
  }

  const handleFinish = () => {
    setArtifacts(artifacts)
    goToScreen('final')
  }

  const isComplete = currentPhase === generatedPlan.length - 1 && phaseProgress >= 90

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold">Workspace</h1>
        <p className="text-sm text-gray-600 mt-2">Phase {currentPhase + 1} of {generatedPlan.length}</p>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Plan Progress */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="font-semibold text-sm uppercase text-gray-600 mb-4">Execution Plan</h2>
              <div className="space-y-3">
                {generatedPlan.map((phase, idx) => (
                  <div
                    key={phase.id}
                    className={`rounded-lg border p-3 transition-all ${
                      idx === currentPhase
                        ? 'border-blue-500 bg-blue-100'
                        : idx < currentPhase
                          ? 'border-green-500 bg-green-100'
                          : 'border-gray-300 bg-white'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900">{phase.name}</p>
                    <div className="mt-2 w-full bg-gray-300 rounded-full h-1 overflow-hidden">
                      <motion.div
                        className={`h-full ${idx === currentPhase ? 'bg-blue-500' : idx < currentPhase ? 'bg-green-500' : 'bg-gray-400'}`}
                        initial={{ width: 0 }}
                        animate={{
                          width: idx === currentPhase ? `${phaseProgress}%` : idx < currentPhase ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {idx === currentPhase ? `${Math.round(phaseProgress)}%` : idx < currentPhase ? 'Complete' : 'Pending'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl space-y-8"
          >
            {/* Current Activity */}
            <div className="rounded-lg border border-blue-300 bg-blue-50 p-6">
              <p className="text-xs uppercase font-semibold text-blue-700 mb-3">Currently Working On</p>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">{generatedPlan[currentPhase].name}</h2>
              {!isComplete ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    System is analyzing your data, modeling scenarios, and generating supporting materials...
                  </p>
                  <button
                    onClick={handleCheckpoint}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
                  >
                    View progress details →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-green-700">✓ All phases complete! Review and download your package.</p>
                  <button
                    onClick={handleFinish}
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-medium text-sm text-white transition-all"
                  >
                    View Final Package
                  </button>
                </div>
              )}
            </div>

            {/* Artifact Previews */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Live Artifacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artifacts.map((artifact) => (
                  <motion.div
                    key={artifact.id}
                    onClick={() => setExpandedArtifact(expandedArtifact === artifact.id ? null : artifact.id)}
                    className="rounded-lg border border-gray-300 bg-white p-6 hover:border-gray-400 cursor-pointer transition-all"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-lg text-gray-900">{artifact.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{Math.round(artifact.progress)}% complete</p>
                      </div>
                      <span className="text-2xl">
                        {artifact.type === 'memo'
                          ? '📝'
                          : artifact.type === 'model'
                            ? '📊'
                            : artifact.type === 'faq'
                              ? '💬'
                              : artifact.type === 'roadmap'
                                ? '🗺️'
                                : '📋'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4 w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${artifact.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Sections */}
                    {expandedArtifact === artifact.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-300 space-y-2"
                      >
                        {artifact.sections.map((section) => (
                          <div key={section.name} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{section.name}</span>
                            <span
                              className={`px-2 py-1 rounded-full ${
                                section.status === 'done'
                                  ? 'text-green-700 bg-green-100'
                                  : section.status === 'in-progress'
                                    ? 'text-blue-700 bg-blue-100'
                                    : 'text-gray-600 bg-gray-200'
                              }`}
                            >
                              {section.status === 'done' ? '✓' : section.status === 'in-progress' ? '⟳' : '○'}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
