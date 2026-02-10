'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { IntakeData } from '@/lib/types'
import { driverDescriptions, involvementLevelDescriptions } from '@/lib/mock-data'

const quickStarts = [
  { label: 'Raising prices 20%', description: 'Simple price increase for existing model' },
  { label: 'Seat → usage model', description: 'Shift from per-user to consumption-based' },
  { label: 'Freemium → paid', description: 'Monetize existing free user base' },
]

export function IntakeScreen() {
  const { setIntake, goToScreen } = useWorkflow()
  const [situation, setSituation] = useState('')
  const [driver, setDriver] = useState<'revenue' | 'margin' | 'competitive' | 'fairness'>('revenue')
  const [involvementLevel, setInvolvementLevel] = useState<'high' | 'checkpoint' | 'executive'>('checkpoint')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (situation.trim()) {
      setIntake({ situation, driver, involvementLevel })
      goToScreen('checklist')
    }
  }

  const handleQuickStart = (selected: string) => {
    setSituation(selected)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-8 py-6">
        <h1 className="text-3xl font-bold">Pricing Decision Assistant</h1>
        <p className="text-sm text-slate-400 mt-2">Navigate complex pricing changes with AI guidance</p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Situation Input */}
            <div>
              <label className="block text-lg font-semibold mb-3">What are you trying to change?</label>
              <p className="text-sm text-slate-400 mb-4">
                Describe your current situation, what you&apos;re considering changing, and why it matters
              </p>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="We currently charge per seat and want to move to a usage-based model to better align with customer value..."
                className="w-full h-32 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />

              {/* Quick starts */}
              <div className="mt-6">
                <p className="text-xs uppercase font-semibold text-slate-500 mb-3">Quick examples:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {quickStarts.map((quick) => (
                    <button
                      key={quick.label}
                      type="button"
                      onClick={() => handleQuickStart(quick.label)}
                      className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 p-3 text-left transition-all group"
                    >
                      <p className="font-medium text-sm group-hover:text-blue-400 transition-colors">{quick.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{quick.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Driver Selection */}
            <div>
              <label className="block text-lg font-semibold mb-4">Primary driver</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(driverDescriptions).map(([key, desc]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDriver(key as typeof driver)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      driver === key
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-medium capitalize">{key}</p>
                    <p className="text-xs text-slate-400 mt-2">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Involvement Level */}
            <div>
              <label className="block text-lg font-semibold mb-4">How involved do you want to be?</label>
              <div className="space-y-2">
                {Object.entries(involvementLevelDescriptions).map(([key, desc]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInvolvementLevel(key as typeof involvementLevel)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      involvementLevel === key
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">{key.replace('-', ' ')} Touch</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!situation.trim()}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
