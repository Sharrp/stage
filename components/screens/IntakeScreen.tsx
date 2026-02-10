'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { IntakeData } from '@/lib/types'
import { driverDescriptions, involvementLevelDescriptions } from '@/lib/mock-data'
import { StepIndicator } from '../StepIndicator'
import { BackButton } from '../BackButton'

const quickStarts = [
  { label: 'Raising prices 20%', description: 'Simple price increase for existing model' },
  { label: 'Seat → usage model', description: 'Shift from per-user to consumption-based' },
  { label: 'Freemium → paid', description: 'Monetize existing free user base' },
]

function extractTitle(description: string): string | null {
  const lower = description.toLowerCase()

  if (lower.includes('price') && lower.includes('increase')) return 'Price Increase'
  if (lower.includes('raise') && lower.includes('price')) return 'Raise Prices'
  if (lower.includes('usage') || lower.includes('consumption')) return 'Switch to Usage-Based'
  if (lower.includes('freemium') || lower.includes('free') && lower.includes('paid')) return 'Monetize Free Tier'
  if (lower.includes('seat')) return 'Change Pricing Model'
  if (lower.includes('tier') || lower.includes('package')) return 'Restructure Pricing Tiers'
  if (lower.includes('margin') || lower.includes('profitability')) return 'Improve Unit Economics'
  if (lower.includes('discount') || lower.includes('negotiat')) return 'Adjust Discount Strategy'
  if (lower.includes('competitor') || lower.includes('competitive')) return 'Respond to Competition'

  return null
}

export function IntakeScreen() {
  const { setIntake, goToScreen } = useWorkflow()
  const [situation, setSituation] = useState('')
  const [driver, setDriver] = useState<'revenue' | 'margin' | 'competitive' | 'fairness'>('revenue')
  const [involvementLevel, setInvolvementLevel] = useState<'high' | 'checkpoint' | 'executive'>('checkpoint')

  const hasDescription = situation.trim().length > 0
  const dynamicTitle = extractTitle(situation) || 'What pricing change are you considering?'

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className={`text-3xl font-bold transition-all duration-300 ${
              hasDescription ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {hasDescription ? dynamicTitle : 'Humbly waiting...'}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {hasDescription
                ? 'Provide details so we can build your decision package'
                : 'Tell us what pricing change you\'re considering'
              }
            </p>
          </div>
          <StepIndicator />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Situation Input */}
              <div>
                <label className="block text-lg font-semibold mb-3">
                  {hasDescription ? 'Tell us more about your situation' : 'Describe the pricing change you&apos;re considering'}
                </label>
                {!hasDescription && (
                  <p className="text-sm text-gray-600 mb-4">
                    What is the current model, what are you changing it to, and why?
                  </p>
                )}
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="We currently charge per seat and want to move to a usage-based model to better align with customer value..."
                  className="w-full h-32 rounded-lg bg-gray-50 border-2 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
                />

              {/* Quick starts - only show before description */}
              {!hasDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <p className="text-xs uppercase font-semibold text-gray-500 mb-3">Quick start examples:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {quickStarts.map((quick) => (
                      <button
                        key={quick.label}
                        type="button"
                        onClick={() => handleQuickStart(quick.label)}
                        className="rounded-lg border-2 border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 p-3 text-left transition-all group"
                      >
                        <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">{quick.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{quick.description}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Driver Selection - appears after description */}
            {hasDescription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-lg font-semibold mb-4">What&apos;s the primary driver?</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(driverDescriptions).map(([key, desc]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDriver(key as typeof driver)}
                      className={`rounded-lg border-2 p-4 text-left transition-all font-medium ${
                        driver === key
                          ? 'border-blue-600 bg-blue-100 text-blue-900'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <p className="capitalize">{key}</p>
                      <p className="text-xs text-gray-600 mt-2 font-normal">{desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Involvement Level - appears after description */}
            {hasDescription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label className="block text-lg font-semibold mb-4">How hands-on do you want to be?</label>
                <div className="space-y-2">
                  {Object.entries(involvementLevelDescriptions).map(([key, desc]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setInvolvementLevel(key as typeof involvementLevel)}
                      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                        involvementLevel === key
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{key.replace('-', ' ')} Touch</p>
                        <p className="text-xs text-gray-600">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <BackButton />
              <button
                type="submit"
                disabled={!situation.trim()}
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-3 font-medium text-white transition-all"
              >
                Continue
              </button>
            </div>
            </form>
          </motion.div>

          {/* Right sidebar - Mock button for description */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8 rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
              <h3 className="text-sm font-bold uppercase text-gray-600 mb-4">💡 Mock Data</h3>
              <button
                type="button"
                onClick={() => setSituation("We're currently charging per seat at $100/user/month but want to transition to a usage-based model to better align with customer value and improve margins.")}
                className="w-full text-left text-sm px-3 py-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-all border border-blue-200"
              >
                ↓ Fill example situation
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
