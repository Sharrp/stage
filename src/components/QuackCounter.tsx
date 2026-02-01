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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Update relative time periodically
  const [, setRefreshTrigger] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleQuack = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setError(null);
      setIsAnimating(true);
      setIsLoading(true);

      // Get the access token from Supabase session
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        // Demo mode: just play sound and animate
        await playQuackSound().catch(() => {});

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

        // Optimistic demo update
        setStats((prev) => {
          if (!prev) {
            return {
              id: 'demo',
              user_id: 'demo',
              total_quacks: 1,
              last_quack_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
          return {
            ...prev,
            total_quacks: prev.total_quacks + 1,
            last_quack_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });

        setError('Demo mode: Sign in to save your quacks!');
        setIsLoading(false);
        setIsAnimating(false);
        return;
      }

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

      // Play sound
      await playQuackSound().catch(() => {
        // Sound failed, but we still want to proceed
      });

      // Optimistic update
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total_quacks: prev.total_quacks + 1,
          last_quack_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // API call to increment quack count
      const response = await fetch('/api/quack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to increment quack count');
      }

      const updatedStats = await response.json();
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Rollback optimistic update
      setStats(initialStats);
    } finally {
      setIsLoading(false);
      setIsAnimating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 p-8 shadow-lg">
      {/* Quack count display */}
      <div className="mb-6 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-orange-600">
          Total Quacks
        </p>
        <p className="text-6xl font-bold text-yellow-600">{stats.total_quacks}</p>
      </div>

      {/* Main quack button */}
      <button
        ref={buttonRef}
        onClick={handleQuack}
        disabled={isLoading}
        className={`relative mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 px-8 py-6 text-4xl font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-75 ${
          isAnimating ? 'animate-pulse' : 'hover:scale-110'
        }`}
      >
        Quack! 🦆
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </button>

      {/* Last quack time */}
      <p className="mb-4 text-center text-sm text-gray-600">
        Last quack: <span className="font-semibold text-orange-600">{formatRelativeTime(stats.last_quack_at)}</span>
      </p>

      {/* Error/Demo state */}
      {error && (
        <div
          className={`mb-4 flex w-full items-center justify-between rounded-lg px-4 py-3 ${
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
              disabled={isLoading}
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
