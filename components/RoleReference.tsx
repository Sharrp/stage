'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function RoleReference() {
  const [isOpen, setIsOpen] = useState(false)

  const systemRoles = [
    'Situation analysis & data gap identification',
    'Segment analysis and customer characterization',
    'Financial modeling (baseline + scenarios)',
    'Option generation and comparison',
    'Risk identification and mitigation planning',
    'Memo & artifact drafting',
    'FAQ generation',
    'Assumption tracking',
  ]

  const userRoles = [
    'Strategic choices (which segments matter, involvement level)',
    'Business judgment (domain context, market knowledge)',
    'Approvals at key checkpoints',
    'Final package review and sign-off',
    'Stakeholder communication strategy',
  ]

  const cantAutomate = [
    'Customer interviews and validation',
    'Executive stakeholder alignment meetings',
    'Legal review and contract negotiations',
    'Board communication (if applicable)',
    'Customer communication and migration planning',
  ]

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
        title="Show role reference"
      >
        ?
      </button>

      {/* Modal Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 border-b border-slate-700 bg-slate-950 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Who Does What?</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-8 space-y-12 text-white">
                {/* System Responsibilities */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🤖</span>
                    <h3 className="text-lg font-semibold">Agent Responsibilities</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Analysis, modeling, documentation, and decision support
                  </p>
                  <div className="space-y-2">
                    {systemRoles.map((role) => (
                      <div
                        key={role}
                        className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
                      >
                        <span className="text-purple-400 mt-0.5">→</span>
                        <span className="text-sm">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Responsibilities */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">👤</span>
                    <h3 className="text-lg font-semibold">Your Responsibilities</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Strategic judgment, decisions, approvals, and stakeholder leadership
                  </p>
                  <div className="space-y-2">
                    {userRoles.map((role) => (
                      <div
                        key={role}
                        className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                      >
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span className="text-sm">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Can't Automate */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🚫</span>
                    <h3 className="text-lg font-semibold">Can&apos;t Automate (you own these)</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Requires human relationships, external context, or accountability
                  </p>
                  <div className="space-y-2">
                    {cantAutomate.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"
                      >
                        <span className="text-orange-400 mt-0.5">⚠</span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Principle */}
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                  <p className="text-sm">
                    <strong className="text-blue-400">Key Principle:</strong> You stay in control of all strategic
                    decisions. The system does analytical heavy lifting and helps you present options clearly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
