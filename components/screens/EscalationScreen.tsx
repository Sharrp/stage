'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { StepIndicator } from '../StepIndicator'

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Missing Data Blocker</h1>
            <p className="text-sm text-gray-600 mt-2">Choose how to proceed</p>
          </div>
          <StepIndicator />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Problem Statement */}
          <div className="rounded-lg border border-red-300 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold mb-2 text-red-900">Can&apos;t calculate churn elasticity</p>
                <p className="text-sm text-red-800">
                  We need historical data showing how customer retention changed in response to past price changes.
                  Without this, we can&apos;t accurately predict how your segments will react to the new model.
                </p>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <details className="group cursor-pointer">
            <summary className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 hover:bg-gray-50 transition-all">
              <span className="font-medium text-gray-900">Why this matters (and what&apos;s at stake)</span>
              <span className="text-gray-600 group-open:rotate-180 transition-transform">↓</span>
            </summary>
            <div className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700 space-y-3">
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
                    ? 'border-blue-600 bg-blue-100'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected === option.id
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-400'
                    }`}
                  >
                    {selected === option.id && <span className="text-xs text-white">✓</span>}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="font-semibold text-lg text-gray-900">{option.title}</p>
                      {option.recommended && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{option.description}</p>

                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-gray-600 mb-1">Tradeoff</p>
                        <p className="text-gray-700">{option.tradeoff}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Confidence Impact</p>
                        <p className={option.confidence.startsWith('+') ? 'text-green-700' : 'text-orange-700'}>
                          {option.confidence}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Timeline Impact</p>
                        <p className="text-gray-700">{option.time}</p>
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
              className="rounded-lg border border-gray-400 px-6 py-3 font-medium text-gray-900 hover:bg-gray-100 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleChoice}
              disabled={!selected}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
            >
              Proceed with selection
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
