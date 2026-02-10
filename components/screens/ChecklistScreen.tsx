'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { checklistItems as initialItems } from '@/lib/mock-data'
import { ChecklistItem } from '@/lib/types'
import { StepIndicator } from '../StepIndicator'

export function ChecklistScreen() {
  const { goToScreen, setChecklist } = useWorkflow()
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, File>>(new Map())
  const [blockedItems, setBlockedItems] = useState<Set<string>>(new Set())

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

  const toggleBlocked = (itemId: string) => {
    const newBlocked = new Set(blockedItems)
    if (newBlocked.has(itemId)) {
      newBlocked.delete(itemId)
      setItems(
        items.map((item) =>
          item.id === itemId && item.status !== 'uploaded' ? { ...item, status: 'missing' } : item
        )
      )
    } else {
      newBlocked.add(itemId)
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, status: 'blocked' } : item
        )
      )
    }
    setBlockedItems(newBlocked)
  }

  const fillWithMocks = () => {
    const mockFiles = initialItems.reduce((acc, item) => {
      acc.set(item.id, new File([`Sample content for ${item.name}`], `${item.name}.txt`))
      return acc
    }, new Map<string, File>())
    setUploadedFiles(mockFiles)
    setItems(
      items.map((item) => ({ ...item, status: 'uploaded', file: mockFiles.get(item.id) }))
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
        return <span className="text-green-600">✓</span>
      case 'missing':
        return <span className="text-gray-400">○</span>
      case 'blocked':
        return <span className="text-orange-600">⊘</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">What data do you have?</h1>
            <p className="text-sm text-gray-600 mt-2">Uploaded {uploadedCount} of {items.length} documents</p>
          </div>
          <StepIndicator />
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex min-h-[calc(100vh-100px)]">
        {/* Sidebar with Mock Fill Button */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Actions</p>
            <button
              onClick={fillWithMocks}
              className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-all"
            >
              Fill with Sample Files
            </button>
          </div>
          <div className="text-xs text-gray-500">
            <p className="font-semibold mb-2">Status: {uploadedCount}/{items.length}</p>
            <p>Blocked: {blockedItems.size}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl px-8 py-12 flex-1">
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
                  <span className="text-red-500">*</span> Required Data
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Missing required data will be noted—we&apos;ll use assumptions but flag confidence levels
                </p>
              </div>

              <div className="space-y-3">
                {requiredItems.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    isBlocked={blockedItems.has(item.id)}
                    onToggleBlocked={() => toggleBlocked(item.id)}
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
                <p className="text-sm text-gray-600 mt-2">
                  These improve accuracy but aren&apos;t blockers
                </p>
              </div>

              <div className="space-y-3">
                {niceToHaveItems.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    isBlocked={blockedItems.has(item.id)}
                    onToggleBlocked={() => toggleBlocked(item.id)}
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
    </div>
  )
}

function ChecklistItemRow({
  item,
  isBlocked,
  onToggleBlocked,
  onUpload,
  statusIcon,
}: {
  item: ChecklistItem
  isBlocked: boolean
  onToggleBlocked: () => void
  onUpload: (file: File) => void
  statusIcon: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-lg border-2 p-4 transition-all group ${
        isBlocked
          ? 'border-orange-400 bg-orange-50'
          : item.status === 'uploaded'
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-lg mt-0.5">{statusIcon}</div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-600 mt-1">{item.reason}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 whitespace-nowrap">
          {item.status === 'uploaded' ? (
            <span className="text-xs font-medium text-green-700">Uploaded</span>
          ) : (
            <>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700">
                <input
                  type="file"
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                  className="hidden"
                />
                <span>Upload</span>
              </label>
              <span className="text-gray-300">|</span>
              <button
                onClick={onToggleBlocked}
                className={`text-xs font-medium transition-colors ${
                  isBlocked
                    ? 'text-orange-700'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {isBlocked ? "Can't share ✓" : "Can't share"}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
