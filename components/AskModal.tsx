'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkflow } from '@/lib/context'

const contextSuggestions: Record<string, string[]> = {
  intake: [
    'Can you give me an example of how to describe this?',
    'What if I have multiple pricing changes to consider?',
    'How do I know which driver to choose?',
  ],
  checklist: [
    'I have additional data you didn\'t ask for—how do I add it?',
    'What if I can\'t get some of this data?',
    'How important is each data source really?',
    'Can I provide data in a different format?',
  ],
  plan: [
    'Can you add more detail to phase X?',
    'Can we skip this phase?',
    'How long will this really take?',
    'What if I don\'t have time for all of this?',
  ],
  workspace: [
    'Can you show me the draft memo?',
    'What assumptions are you making?',
    'Can we speed this up?',
    'What happens if churn is higher than expected?',
  ],
  checkpoint: [
    'Can you explain why this choice matters?',
    'What if I choose differently?',
    'Can I see the impact of each option?',
    'I need more context on this decision.',
  ],
  escalation: [
    'What\'s the real impact of this missing data?',
    'Can you use a different approach?',
    'How long to gather this data?',
    'What\'s your recommendation?',
  ],
  final: [
    'Can you change the tone of the memo?',
    'Can I get just one deliverable?',
    'How do I present this to my team?',
    'What questions should I prepare for?',
  ],
}

export function AskModal() {
  const { state } = useWorkflow()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ id: string; text: string; timestamp: Date }[]>([])

  const suggestions = contextSuggestions[state.screen] || contextSuggestions.intake

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        timestamp: new Date(),
      }
      setMessages([...messages, newMessage])
      setMessage('')

      // Auto-close after 2 seconds if no more input
      setTimeout(() => {
        if (message === '') {
          setIsOpen(false)
        }
      }, 1000)
    }
  }

  const handleSuggestion = (suggestion: string) => {
    setMessage(suggestion)
  }

  return (
    <>
      {/* Floating Ask Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40"
        title="Ask the system anything"
      >
        💬
      </motion.button>

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-end justify-center p-4 z-50 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="w-full max-w-2xl max-h-96 bg-white rounded-lg shadow-2xl flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Ask the System</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Messages history */}
              {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 p-3"
                    >
                      <p className="text-sm text-gray-900">{msg.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {messages.length === 0 && (
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-gray-50">
                  <p className="text-xs uppercase font-semibold text-gray-500 mb-3">Common questions:</p>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(suggestion)}
                      className="w-full text-left text-sm p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200 px-6 py-4 bg-white">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about anything..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium text-sm transition-all"
                  >
                    Send
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
