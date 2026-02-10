'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'

export function EscalationScreen() {
  const { goToScreen } = useWorkflow()
  const [selected, setSelected] = useState<string | null>(null)

  const options = [
    {
      id: 'benchmark',
      title: 'Use industry benchmark',
      description: 'We can model with standard elasticity curves for your market',
      tradeoff: 'Lower accuracy, but moves forward immediately',
      confidence: '-20%',
      time: 'No delay',
      recommended: true,
    },
    {
      id: 'provide-data',
      title: 'I\'ll provide proxy data',
      description: 'Upload alternative data sources that correlate with price sensitivity',
      tradeoff: 'More accurate, requires your input',
      confidence: '-5%',
      time: '+2 hours',
    },
    {
      id: 'pause',
      title: 'Pause and gather data',
      description: 'Put this decision on hold until you have better data sources',
      tradeoff: 'Best accuracy, but adds timeline',
      confidence: '+10%',
      time: '+2-5 days',
    },
  ]

  const handleChoice = () => {
    goToScreen('workspace')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-8 py-6">
        <h1 className="text-3xl font-bold">Missing Data Blocker</h1>
        <p className="text-sm text-slate-400 mt-2">Choose how to proceed</p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Problem Statement */}
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold mb-2">Can&apos;t calculate churn elasticity</p>
                <p className="text-sm text-slate-300">
                  We need historical data showing how customer retention changed in response to past price changes.
                  Without this, we can&apos;t accurately predict how your segments will react to the new model.
                </p>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <details className="group cursor-pointer">
            <summary className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4 hover:bg-slate-700 transition-all">
              <span className="font-medium">Why this matters (and what&apos;s at stake)</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">↓</span>
            </summary>
            <div className="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300 space-y-3">
              <p>
                <strong>Without elasticity:</strong> We can estimate price impact based on industry averages,
                but we won&apos;t know if your customers are more or less price-sensitive than typical.
              </p>
              <p>
                <strong>This affects:</strong> Revenue forecasts (could be ±15-20%), risk assessment (do we expect
                churn?), and strategy (do we need migration incentives?).
              </p>
              <p>
                <strong>Bottom line:</strong> We can proceed and flag this as our biggest assumption. Or we can spend
                2-5 days gathering better data.
              </p>
            </div>
          </details>

          {/* Options */}
          <div className="space-y-4">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                  selected === option.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected === option.id
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {selected === option.id && <span className="text-xs">✓</span>}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="font-semibold text-lg">{option.title}</p>
                      {option.recommended && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 whitespace-nowrap">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{option.description}</p>

                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 mb-1">Tradeoff</p>
                        <p className="text-slate-300">{option.tradeoff}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Confidence Impact</p>
                        <p className={option.confidence.startsWith('+') ? 'text-green-400' : 'text-orange-400'}>
                          {option.confidence}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Timeline Impact</p>
                        <p className="text-slate-300">{option.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8">
            <button
              onClick={() => goToScreen('workspace')}
              className="rounded-lg border border-slate-600 px-6 py-3 font-medium text-white hover:bg-slate-800 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleChoice}
              disabled={!selected}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all"
            >
              Proceed with selection
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
