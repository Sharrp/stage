'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'

export function FinalScreen() {
  const { state, goToScreen, reset } = useWorkflow()
  const [selectedForDownload, setSelectedForDownload] = useState<string[]>(['memo', 'model', 'roadmap', 'faq'])

  const deliverables = [
    {
      id: 'memo',
      name: 'Decision Memo',
      icon: '📝',
      description: 'Executive summary with recommendation, analysis, and risk mitigation',
      sections: 5,
    },
    {
      id: 'model',
      name: 'Revenue Model (Excel)',
      icon: '📊',
      description: 'Detailed scenarios, sensitivity analysis, and assumptions',
      sections: 3,
    },
    {
      id: 'roadmap',
      name: 'Implementation Roadmap',
      icon: '🗺️',
      description: 'Phase-by-phase execution plan with timeline and responsibilities',
      sections: 3,
    },
    {
      id: 'faq',
      name: 'FAQ & Materials',
      icon: '💬',
      description: 'Internal and customer-facing Q&A, talking points',
      sections: 3,
    },
  ]

  const metaDocs = [
    {
      name: 'Decision Log',
      description: 'What was decided, when, and by whom',
      icon: '📋',
    },
    {
      name: 'Assumption Registry',
      description: 'All assumptions and what would invalidate them',
      icon: '⚠️',
    },
    {
      name: 'Confidence Report',
      description: 'Color-coded confidence levels by section',
      icon: '📈',
    },
  ]

  const handleDownload = () => {
    // Simulate download
    alert(`Downloading: ${selectedForDownload.join(', ')}\n\nIn a real app, this would generate and download your package.`)
  }

  const handleReset = () => {
    reset()
    goToScreen('intake')
  }

  const toggleDownload = (id: string) => {
    setSelectedForDownload((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold">✓ Decision Package Complete</h1>
        <p className="text-sm text-gray-600 mt-2">All deliverables ready for download</p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Main Deliverables */}
          <div>
            <h2 className="text-lg font-semibold mb-6 text-gray-900">Deliverables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {deliverables.map((deliverable) => (
                <motion.button
                  key={deliverable.id}
                  onClick={() => toggleDownload(deliverable.id)}
                  whileHover={{ y: -4 }}
                  className={`rounded-lg border-2 p-6 text-left transition-all ${
                    selectedForDownload.includes(deliverable.id)
                      ? 'border-blue-600 bg-blue-100'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-3xl">{deliverable.icon}</span>
                    <input
                      type="checkbox"
                      checked={selectedForDownload.includes(deliverable.id)}
                      onChange={() => toggleDownload(deliverable.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="font-semibold text-lg text-gray-900">{deliverable.name}</p>
                  <p className="text-sm text-gray-600 mt-2">{deliverable.description}</p>
                  <p className="text-xs text-gray-500 mt-3">{deliverable.sections} sections</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Meta-Documents */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Included in All Downloads</h2>
            <p className="text-sm text-gray-600 mb-4">
              These documents track decisions and confidence levels to support stakeholder alignment
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metaDocs.map((doc) => (
                <div key={doc.name} className="rounded-lg border border-gray-300 bg-white p-4">
                  <span className="text-2xl">{doc.icon}</span>
                  <p className="font-semibold text-sm mt-3 text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-600 mt-2">{doc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Artifacts */}
          <div>
            <h2 className="text-lg font-semibold mb-6 text-gray-900">Preview: Decision Memo</h2>
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-8 space-y-4 font-mono text-xs text-gray-700 max-h-64 overflow-y-auto">
              <div>
                <p className="font-bold text-blue-600">PRICING DECISION MEMO</p>
                <p className="text-gray-600 mt-1">Prepared for: Executive Team</p>
              </div>
              <div className="pt-4 border-t border-gray-300">
                <p className="font-bold text-gray-900">RECOMMENDATION</p>
                <p className="mt-2">Implement hybrid pricing model with usage-based component for X segment while maintaining seat-based for Y segment.</p>
              </div>
              <div className="pt-4 border-t border-gray-300">
                <p className="font-bold text-gray-900">KEY FINDINGS</p>
                <p className="mt-2">• Revenue impact: +$X-Y in year 1 depending on migration curve</p>
                <p>• Churn risk: Moderate (15-20%) for segment A if not handled carefully</p>
                <p>• Confidence: 78% based on available data; limited by churn elasticity gap</p>
              </div>
              <div className="pt-4 border-t border-gray-300">
                <p className="font-bold text-gray-900">NEXT STEPS</p>
                <p className="mt-2">1. Stakeholder review (timeline: 1 week)</p>
                <p>2. Customer communication strategy (timeline: 2 weeks)</p>
                <p>3. System implementation (timeline: 3-4 weeks)</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              ↑ This is a preview. Full document is much more detailed with appendices.
            </p>
          </div>

          {/* Download Section */}
          <div className="rounded-lg border border-blue-300 bg-blue-50 p-6">
            <p className="text-sm mb-6 text-gray-900">
              You&apos;re downloading <strong>{selectedForDownload.length} documents</strong> in a single package (.zip) with
              a README that explains each file&apos;s purpose.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedForDownload(deliverables.map((d) => d.id))}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedForDownload([])}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Select None
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8">
            <button
              onClick={handleReset}
              className="rounded-lg border border-gray-400 px-6 py-3 font-medium text-gray-900 hover:bg-gray-100 transition-all"
            >
              Start Over
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-medium text-white hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
            >
              <span>⬇️</span> Download Package
            </button>
          </div>

          {/* Footer */}
          <div className="rounded-lg border border-gray-300 bg-white p-4 text-xs text-gray-600">
            <p>
              <strong className="text-gray-900">Next steps in your process:</strong> Share this package with stakeholders, gather feedback,
              and align on implementation approach. The decision log helps track approvals as they come in.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
