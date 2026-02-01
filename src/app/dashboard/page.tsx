/**
 * Dashboard page with quack counter
 */

import { redirect } from 'next/navigation';
import QuackCounter from '@/components/QuackCounter';
import { getQuackStats } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';

export const metadata = {
  title: 'Dashboard - Quack Counter',
  description: 'Your personal quack counter dashboard',
};

export default async function DashboardPage() {
  // Note: For a production app, implement proper auth using @supabase/ssr
  // This is a simplified version that allows access without authentication

  let quackStats = null;

  // For now, quack stats are loaded client-side from Supabase session
  // In production, you would:
  // 1. Get the session from cookies using @supabase/ssr
  // 2. Verify the user is authenticated
  // 3. Fetch quack stats server-side
  // 4. Pass the data to the component

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Welcome to Quack! 🦆</h1>
          <p className="text-lg text-gray-600">Click the button below to start quacking!</p>
        </div>

        {/* Quack Counter */}
        <QuackCounter initialStats={quackStats} />

        {/* Stats info */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm font-medium text-gray-600">Total Quacks</p>
            <p className="mt-1 text-3xl font-bold text-yellow-600">
              {quackStats?.total_quacks || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm font-medium text-gray-600">Last Activity</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {quackStats?.last_quack_at ? '✅ Active' : '⏳ Waiting'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Keep quacking! The more you quack, the louder you become. 🦆</p>
        </div>
      </div>
    </main>
  );
}
