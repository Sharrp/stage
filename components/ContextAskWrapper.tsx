'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AskContext {
  x: number
  y: number
  elementLabel: string
  element: HTMLElement | null
}

function getElementLabel(element: HTMLElement): string {
  // Check for semantic labels
  const heading = element.closest('h1, h2, h3, h4, h5, h6')
  if (heading) return heading.textContent || 'this section'

  const label = element.closest('label')
  if (label) return label.textContent || 'this field'

  // Check for title in parent chain
  let current = element
  while (current && current !== document.body) {
    const title = current.getAttribute('title')
    if (title) return title
    const ariaLabel = current.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel
    current = current.parentElement!
  }

  // Try to find nearby label or heading
  current = element.parentElement!
  while (current && current !== document.body) {
    const heading = current.querySelector('h1, h2, h3, h4, h5, h6')
    if (heading) return heading.textContent || 'this section'
    current = current.parentElement!
  }

  // Fall back to text content (first 50 chars)
  const text = element.textContent?.trim() || ''
  if (text && text.length > 3) {
    const short = text.substring(0, 60).replace(/\n/g, ' ').trim()
    return short.length < 60 ? short : short.substring(0, 57) + '...'
  }

  return 'this content'
}

function findMeaningfulElement(element: HTMLElement): HTMLElement {
  // Start from clicked element and walk up to find meaningful container
  let current = element

  // Walk up to find a container with meaningful content
  while (current && current !== document.body) {
    const text = current.textContent?.trim() || ''
    const hasContent = text.length > 10

    // Stop at common content boundaries
    if (
      hasContent &&
      (current.tagName === 'TEXTAREA' ||
        current.tagName === 'BUTTON' ||
        current.tagName === 'INPUT' ||
        current.classList.contains('rounded-lg') ||
        current.classList.contains('bg-white') ||
        current.classList.contains('bg-gray-50') ||
        current.classList.contains('border'))
    ) {
      return current
    }

    current = current.parentElement!
  }

  return element
}

export function ContextAskWrapper({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<AskContext | null>(null)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const highlightRef = useRef<HTMLElement | null>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()

    const target = e.target as HTMLElement
    const meaningfulElement = findMeaningfulElement(target)
    const label = getElementLabel(meaningfulElement)

    highlightRef.current = meaningfulElement

    setContext({
      x: e.clientX,
      y: e.clientY,
      elementLabel: label,
      element: meaningfulElement,
    })

    setMessage('')

    // Focus input after animation
    setTimeout(() => {
      inputRef.current?.focus()
    }, 150)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)

    // Highlight element briefly
    if (highlightRef.current) {
      const el = highlightRef.current
      const originalBg = el.style.backgroundColor
      const originalOutline = el.style.outline
      const originalTransition = el.style.transition

      el.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
      el.style.outline = '2px solid rgb(59, 130, 246)'
      el.style.transition = 'all 0.3s ease'

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Reset
      el.style.backgroundColor = originalBg
      el.style.outline = originalOutline
      el.style.transition = originalTransition
    }

    // Close
    setTimeout(() => {
      setContext(null)
      setIsSubmitting(false)
      highlightRef.current = null
    }, 200)
  }

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setContext(null)
    }
  }

  // Calculate position with viewport bounds
  let popupX = 0
  let popupY = 0
  if (context) {
    popupX = Math.max(16, Math.min(context.x - 160, window.innerWidth - 336))
    popupY = Math.max(16, context.y - 60)
  }

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>

      {/* Backdrop and Input */}
      <AnimatePresence>
        {context && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClickOutside}
              className="fixed inset-0 z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -15 }}
              transition={{ duration: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                position: 'fixed',
                left: `${popupX}px`,
                top: `${popupY}px`,
              }}
              className="z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <p className="text-xs uppercase font-semibold text-gray-500">
                  Ask about:{' '}
                  <span className="text-blue-600 font-bold block mt-1 text-sm">
                    {context.elementLabel}
                  </span>
                </p>

                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Ask about this...`}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setContext(null)
                    }
                  }}
                  disabled={isSubmitting}
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setContext(null)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim() || isSubmitting}
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium text-sm transition-all"
                  >
                    {isSubmitting ? 'Asking...' : 'Ask'}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Highlight box */}
            {context.element && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed pointer-events-none z-40 border-2 border-blue-500 rounded-lg shadow-lg"
                style={{
                  ...context.element.getBoundingClientRect(),
                  left: context.element.getBoundingClientRect().left,
                  top: context.element.getBoundingClientRect().top,
                  width: context.element.getBoundingClientRect().width,
                  height: context.element.getBoundingClientRect().height,
                }}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </>
  )
}
