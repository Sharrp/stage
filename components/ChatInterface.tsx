'use client';

import { useState } from 'react';
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
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="space-y-4">
        {/* Messages */}
        {message ? (
          <div className="space-y-3">
            {/* User bubble */}
            <div className="flex justify-end">
              <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-white break-words max-w-xs">
                {message.userMessage}
              </div>
            </div>

            {/* Assistant bubble */}
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 break-words max-w-xs">
                {message.assistantMessage}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Send a message to get a sarcastic rhyme!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
          <div className="space-y-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, 50))}
              placeholder="Your message..."
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
            />
            <div className="flex justify-between items-center">
              <div className={`text-sm font-medium ${inputValue.length === 50 ? 'text-red-600' : 'text-gray-600'}`}>
                {inputValue.length}/50
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full rounded-lg bg-[#fb607f] px-6 py-2 font-medium text-white hover:bg-[#e55670] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
