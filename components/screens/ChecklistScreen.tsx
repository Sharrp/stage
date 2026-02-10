'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { checklistItems as initialItems } from '@/lib/mock-data'
import { ChecklistItem } from '@/lib/types'

export function ChecklistScreen() {
  const { goToScreen, setChecklist } = useWorkflow()
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, File>>(new Map())

  const handleFileUpload = (itemId: string, file: File) => {
    const newUploaded = new Map(uploadedFiles)
    newUploaded.set(itemId, file)
    setUploadedFiles(newUploaded)

    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, status: 'uploaded', file } : item
      )
    )
  }

  const handleContinue = () => {
    setChecklist(items)
    goToScreen('plan')
  }

  const requiredItems = items.filter((i) => i.category === 'required')
  const niceToHaveItems = items.filter((i) => i.category === 'nice-to-have')
  const uploadedCount = items.filter((i) => i.status === 'uploaded').length
  const missingRequired = requiredItems.filter((i) => i.status === 'missing').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <span className="text-green-400">✓</span>
      case 'missing':
        return <span className="text-slate-500">○</span>
      case 'blocked':
        return <span className="text-orange-400">⊘</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-8 py-6">
        <h1 className="text-3xl font-bold">What data do you have?</h1>
        <p className="text-sm text-slate-400 mt-2">Uploaded {uploadedCount} of {items.length} documents</p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Required Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-red-400">*</span> Required Data
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Missing required data will be noted—we&apos;ll use assumptions but flag confidence levels
              </p>
            </div>

            <div className="space-y-3">
              {requiredItems.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onUpload={(file) => handleFileUpload(item.id, file)}
                  statusIcon={getStatusIcon(item.status)}
                />
              ))}
            </div>
          </div>

          {/* Nice-to-Have Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Nice-to-Have Data</h2>
              <p className="text-sm text-slate-400 mt-2">
                These improve accuracy but aren&apos;t blockers
              </p>
            </div>

            <div className="space-y-3">
              {niceToHaveItems.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onUpload={(file) => handleFileUpload(item.id, file)}
                  statusIcon={getStatusIcon(item.status)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8">
            <button
              onClick={handleContinue}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              {missingRequired > 0 ? `Continue with ${missingRequired} gaps` : 'All set'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ChecklistItemRow({
  item,
  onUpload,
  statusIcon,
}: {
  item: ChecklistItem
  onUpload: (file: File) => void
  statusIcon: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-lg border border-slate-700 bg-slate-800 p-4 hover:border-slate-600 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-lg mt-0.5">{statusIcon}</div>
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
          </div>
        </div>

        {item.status === 'blocked' ? (
          <span className="text-xs font-medium text-orange-400 whitespace-nowrap">Can&apos;t share</span>
        ) : item.status === 'uploaded' ? (
          <span className="text-xs font-medium text-green-400 whitespace-nowrap">Uploaded</span>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              className="hidden"
            />
            <span className="text-xs font-medium text-blue-400 hover:text-blue-300 whitespace-nowrap">
              Upload
            </span>
          </label>
        )}
      </div>
    </motion.div>
  )
}
