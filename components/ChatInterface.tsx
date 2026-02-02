'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface ChatInterfaceProps {
  initialMessage?: {
    userMessage: string;
    assistantMessage: string;
  } | null;
}

export default function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [message, setMessage] = useState<{
    userMessage: string;
    assistantMessage: string;
  } | null>(initialMessage || null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageKey, setMessageKey] = useState(0); // Track message changes for animations

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedInput = inputValue.trim();

    // Validation
    if (!trimmedInput || trimmedInput.length > 50) {
      return;
    }

    // Get session and token
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError('Sign in to chat');
      return;
    }

    const previousMessage = message;

    // Optimistic update
    setMessage({
      userMessage: trimmedInput,
      assistantMessage: 'Loading...',
    });
    setMessageKey((prev) => prev + 1);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: trimmedInput,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      const data = await response.json();
      setMessage({
        userMessage: data.userMessage,
        assistantMessage: data.assistantMessage,
      });
      setInputValue('');
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      // Remove optimistic update on error, revert to previous message
      setMessage(previousMessage || null);
      // Don't clear input on error - allow retry
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled =
    !inputValue.trim() ||
    inputValue.length > 50 ||
    isLoading;

  return (
    <div className="rounded-xl bg-card p-8 shadow-sm">
      <div className="space-y-6">
        {/* Messages */}
        <div className="relative min-h-[200px] overflow-hidden">
          <AnimatePresence mode="popLayout">
            {message ? (
              <motion.div
                key={`message-${messageKey}`}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ y: -200 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {/* User bubble */}
                <motion.div
                  key={`user-${message.userMessage}`}
                  className="flex justify-end"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <div className="rounded-2xl bg-primary px-5 py-3 text-primary-foreground break-words max-w-sm shadow-sm">
                    {message.userMessage}
                  </div>
                </motion.div>

                {/* Assistant bubble or typing indicator */}
                <motion.div
                  key={`assistant-${message.assistantMessage}`}
                  className="flex justify-start"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {isLoading ? (
                    <div className="rounded-2xl bg-secondary px-5 py-3 flex items-center gap-1">
                      <motion.div
                        className="w-2 h-2 bg-secondary-foreground rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-secondary-foreground rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-secondary-foreground rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-secondary px-5 py-3 text-secondary-foreground break-words max-w-sm">
                      {message.assistantMessage}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                className="py-12 text-center text-muted-foreground flex items-center justify-center h-[200px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Send a message to get a sarcastic rhyme!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700 text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-6">
          <div className="space-y-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, 50))}
              placeholder="Your message..."
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:bg-muted disabled:cursor-not-allowed transition-all"
            />
            <div className="flex justify-between items-center">
              <div className={`text-sm font-medium ${inputValue.length === 50 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {inputValue.length}/50
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent-foreground disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
