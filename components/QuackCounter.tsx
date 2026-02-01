'use client';

import { useState, useEffect, useRef } from 'react';
import { playQuackSound } from '@/lib/audio';
import { createClient } from '@/lib/supabase/client';
import type { QuackStats } from '@/lib/supabase/database.types';

interface QuackCounterProps {
  initialStats: QuackStats | null;
}

/**
 * Formats a date into a friendly relative time string
 */
function formatRelativeTime(date: string | null): string {
  if (!date) return 'Never';

  const now = new Date();
  const then = new Date(date);
  const diffSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(diffSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

/**
 * Formats a date into a time duration string (without "ago")
 */
function formatTimeDuration(date: string | null): string {
  if (!date) return 'Never';

  const now = new Date();
  const then = new Date(date);
  const diffSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  const days = Math.floor(diffSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''}`;
}

/**
 * Creates a floating duck emoji animation
 */
function createFloatingDuck(x: number, y: number): HTMLElement {
  const duck = document.createElement('div');
  duck.textContent = '🦆';
  duck.className = 'fixed pointer-events-none text-3xl';
  duck.style.left = `${x}px`;
  duck.style.top = `${y}px`;
  duck.style.animation = 'float-up 1s ease-out forwards';

  document.body.appendChild(duck);

  // Remove after animation completes
  setTimeout(() => duck.remove(), 1000);

  return duck;
}

export default function QuackCounter({ initialStats }: QuackCounterProps) {
  // Use demo stats if no initial stats provided
  const demoStats: QuackStats = {
    id: 'demo',
    user_id: 'demo',
    total_quacks: 0,
    last_quack_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [stats, setStats] = useState<QuackStats>(initialStats || demoStats);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingClicksRef = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);

  // Update relative time periodically
  const [, setRefreshTrigger] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => {
      clearInterval(interval);
      // Clean up debounce timer on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const syncWithServer = async () => {
    if (isSyncingRef.current || pendingClicksRef.current === 0) {
      return;
    }

    isSyncingRef.current = true;
    const clicksToSync = pendingClicksRef.current;
    pendingClicksRef.current = 0;

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Demo mode: Sign in to save your quacks!');
        return;
      }

      // Send a single request with the total increment amount
      const response = await fetch('/api/quack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          increment: clicksToSync,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sync quacks');
      }

      const finalStats = await response.json();

      // Update to the final server state
      setStats(finalStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Keep the optimistic count on error
    } finally {
      isSyncingRef.current = false;

      // If more clicks came in while syncing, schedule another sync
      if (pendingClicksRef.current > 0) {
        debounceTimerRef.current = setTimeout(syncWithServer, 500);
      }
    }
  };

  const handleQuack = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger animation briefly for this click
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    setError(null);

    // Create floating ducks
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          createFloatingDuck(
            centerX + (Math.random() - 0.5) * 50,
            centerY + (Math.random() - 0.5) * 50
          );
        }, i * 100);
      }
    }

    // Play sound (non-blocking)
    playQuackSound().catch(() => {});

    // Optimistic UI update - increment immediately
    const newTimestamp = new Date().toISOString();
    setStats((prev) => ({
      ...prev,
      total_quacks: prev.total_quacks + 1,
      last_quack_at: newTimestamp,
      updated_at: newTimestamp,
    }));

    // Track this pending click
    pendingClicksRef.current += 1;

    // Clear existing timer and start new one (debounce)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Schedule sync after 500ms of inactivity
    debounceTimerRef.current = setTimeout(syncWithServer, 500);
  };

  return (
    <div className="flex w-full max-w-[500px] flex-col items-center justify-center space-y-6">
      {/* Title with Quack button */}
      <div className="text-center text-6xl md:text-[9rem] lg:text-[11rem] font-bold text-gray-900 tracking-wider uppercase leading-tight" style={{ fontSize: '3.75rem', fontWeight: '700' }}>
        You can{' '}
        <button
          ref={buttonRef}
          onClick={handleQuack}
          className={`relative border-2 border-gray-900 px-4 py-1 font-bold text-gray-900 transition-all duration-200 hover:bg-gray-900 hover:text-white ${
            isAnimating ? 'animate-pulse' : ''
          }`}
          style={{ fontSize: '0.6em', lineHeight: '1', verticalAlign: 'baseline' }}
        >
          Quack
        </button>
        {' '}🦆
      </div>

      {/* Stats display */}
      <div className="grid w-full grid-cols-2 gap-4 rounded-lg bg-white p-6 shadow-lg">
        {/* Total Quacks */}
        <div className="text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-orange-600">
            Total Quacks
          </p>
          <p className="text-4xl font-bold text-yellow-600">{stats.total_quacks}</p>
        </div>

        {/* Time without quacks */}
        <div className="text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-orange-600">
            Time Without Quacks
          </p>
          <p className="text-4xl font-bold text-yellow-600">{formatTimeDuration(stats.last_quack_at)}</p>
        </div>
      </div>

      {/* Error/Demo state */}
      {error && (
        <div
          className={`w-full flex items-center justify-between rounded-lg px-4 py-3 ${
            error.includes('Demo mode')
              ? 'bg-blue-100 text-blue-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{error}</p>
          </div>
          {!error.includes('Demo mode') && (
            <button
              onClick={handleQuack}
              className={`ml-3 rounded px-3 py-1 text-sm font-medium ${
                error.includes('Demo mode')
                  ? 'hover:bg-blue-200'
                  : 'hover:bg-red-200'
              }`}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Floating duck emoji animation styles */}
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}
