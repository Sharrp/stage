'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkflow } from '@/lib/context'
import { ContextItem } from '@/lib/types'

export function ContextInput() {
  const { state, addContextItem, removeContextItem } = useWorkflow()
  const [inputMode, setInputMode] = useState<'text' | 'image' | 'link'>('image')
  const [textInput, setTextInput] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const [label, setLabel] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const contextItems = state.contextItems || []

  const handleAddText = () => {
    if (textInput.trim()) {
      const item: ContextItem = {
        id: `context-${Date.now()}`,
        type: 'text',
        label: label || 'Text Context',
        content: textInput,
        addedAt: Date.now(),
      }
      addContextItem(item)
      setTextInput('')
      setLabel('')
    }
  }

  const handleAddLink = () => {
    if (linkInput.trim()) {
      const item: ContextItem = {
        id: `context-${Date.now()}`,
        type: 'link',
        label: label || linkInput,
        url: linkInput,
        addedAt: Date.now(),
      }
      addContextItem(item)
      setLinkInput('')
      setLabel('')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const item: ContextItem = {
        id: `context-${Date.now()}`,
        type: 'image',
        label: label || file.name,
        file,
        addedAt: Date.now(),
      }
      addContextItem(item)
      setLabel('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        const item: ContextItem = {
          id: `context-${Date.now()}`,
          type: 'image',
          label: label || file.name,
          file,
          addedAt: Date.now(),
        }
        addContextItem(item)
        setLabel('')
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝'
      case 'image':
        return '📸'
      case 'link':
        return '🔗'
      case 'document':
        return '📄'
      default:
        return '📌'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'Text'
      case 'image':
        return 'Screenshot'
      case 'link':
        return 'Link'
      case 'document':
        return 'Document'
      default:
        return 'Context'
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Add Context</h2>
        <p className="text-sm text-gray-600 mt-2">
          Slack conversations, Figma designs, screenshots, links, or anything else relevant
        </p>
      </div>

      <div className="space-y-4">
        {/* Input Modes */}
        <div className="flex gap-3">
          {[
            { mode: 'text' as const, label: 'Text/Slack', icon: '📝' },
            { mode: 'image' as const, label: 'Screenshot', icon: '📸' },
            { mode: 'link' as const, label: 'Link', icon: '🔗' },
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => setInputMode(option.mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                inputMode === option.mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option.icon}</span> {option.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg border-2 border-gray-300 p-6 space-y-4">
          {/* Label */}
          <input
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />

          {/* Mode-specific input */}
          {inputMode === 'text' && (
            <>
              <textarea
                placeholder="Paste Slack conversation, requirements, or any text context..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                rows={6}
              />
              <button
                onClick={handleAddText}
                disabled={!textInput.trim()}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add Text Context
              </button>
            </>
          )}

          {inputMode === 'image' && (
            <>
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <p className="text-lg text-gray-600">📸 Drag & drop screenshots here</p>
                <p className="text-sm text-gray-500 mt-2">or click to browse</p>
                <p className="text-xs text-gray-500 mt-3">Figma designs, wireframes, mockups, etc.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </>
          )}

          {inputMode === 'link' && (
            <>
              <input
                type="url"
                placeholder="Paste link (Figma doc, Slack thread, etc.)"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddLink}
                disabled={!linkInput.trim()}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add Link
              </button>
            </>
          )}
        </div>

        {/* Added Context Items */}
        {contextItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Added Context ({contextItems.length})</h4>
            <div className="space-y-2">
              {contextItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-start justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-lg mt-1">{getTypeIcon(item.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 break-words">{item.label}</p>
                      <p className="text-xs text-gray-500">
                        {getTypeLabel(item.type)} • {new Date(item.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {item.content && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.content}</p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          {item.url}
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeContextItem(item.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors mt-1"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
