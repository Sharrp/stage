'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { CheckpointPrompt } from '@/lib/types'
import { StepIndicator } from '../StepIndicator'

const mockCheckpoint: CheckpointPrompt = {
  id: 'segment-priority',
  title: 'Segment Prioritization',
  context: 'Based on analysis of your revenue data, I\'ve identified 3 customer segments with different price sensitivities.',
  question: 'Which segments are you unwilling to lose? (even if it means slower pricing growth)',
  options: [
    {
      id: 'enterprise',
      label: 'Enterprise customers',
      description: 'High-value accounts with long contracts—usually tolerant of price increases',
    },
    {
      id: 'mid-market',
      label: 'Mid-market',
      description: 'Balance of revenue stability and growth potential',
    },
    {
      id: 'startup',
      label: 'Startup/growth segment',
      description: 'Price-sensitive, fast-growing, strategic moat-building segment',
    },
  ],
  impact:
    'Your selection shapes which pricing model we prioritize. Protecting startups means we need a more aggressive freemium tier or per-usage option.',
  dataUsed: ['Customer list & segments', 'Historical revenue & usage', 'Churn & expansion data'],
  confidence: 0.78,
}

export function CheckpointScreen() {
  const { goToScreen } = useWorkflow()
  const [selected, setSelected] = useState<string[]>(['enterprise', 'mid-market'])
  const [showPause, setShowPause] = useState(false)

  const handleContinue = () => {
    goToScreen('workspace')
  }

  const handlePause = () => {
    goToScreen('workspace')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Strategic Decision Needed</h1>
            <p className="text-sm text-gray-600 mt-2">Your input shapes the pricing model we build</p>
          </div>
          <StepIndicator />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Context Card */}
          <div className="rounded-lg border border-gray-300 bg-white p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600 mb-2">What System Just Found</p>
                <p className="text-sm leading-relaxed text-gray-900">{mockCheckpoint.context}</p>
              </div>
            </div>
          </div>

          {/* Question */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{mockCheckpoint.question}</h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {mockCheckpoint.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    if (selected.includes(option.id)) {
                      setSelected(selected.filter((id) => id !== option.id))
                    } else {
                      setSelected([...selected, option.id])
                    }
                  }}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    selected.includes(option.id)
                      ? 'border-blue-600 bg-blue-100'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selected.includes(option.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-400'
                      }`}
                    >
                      {selected.includes(option.id) && <span className="text-xs text-white">✓</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Impact Preview */}
            <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 mb-8">
              <p className="text-xs uppercase font-semibold text-orange-800 mb-2">Impact</p>
              <p className="text-sm text-orange-900">{mockCheckpoint.impact}</p>
            </div>

            {/* Confidence & Data Used */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <p className="text-xs uppercase font-semibold text-gray-600 mb-2">Confidence Level</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-blue-600">{Math.round(mockCheckpoint.confidence * 100)}%</p>
                  <p className="text-xs text-gray-600 mb-1">based on available data</p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <p className="text-xs uppercase font-semibold text-gray-600 mb-3">Data Used</p>
                <div className="space-y-1">
                  {mockCheckpoint.dataUsed.map((item) => (
                    <p key={item} className="text-xs text-gray-600 flex items-center gap-2">
                      <span>✓</span> {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!showPause ? (
            <div className="flex gap-4">
              <button
                onClick={() => setShowPause(true)}
                className="rounded-lg border border-gray-400 px-6 py-3 font-medium text-gray-900 hover:bg-gray-100 transition-all"
              >
                I need to think
              </button>
              <button
                onClick={handleContinue}
                disabled={selected.length === 0}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
              >
                Continue with selected {selected.length > 0 && `(${selected.length})`}
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-300 bg-white p-6">
              <p className="font-semibold mb-4 text-gray-900">When you&apos;re ready, come back to this decision.</p>
              <p className="text-sm text-gray-600 mb-6">
                The system will pause here. You can close this tab, work on other things, and return whenever you&apos;re ready to make this choice.
              </p>
              <button
                onClick={handlePause}
                className="w-full rounded-lg border border-gray-400 px-6 py-3 font-medium text-gray-900 hover:bg-gray-100 transition-all"
              >
                Got it, pause for now
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
