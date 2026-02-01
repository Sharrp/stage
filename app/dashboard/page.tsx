import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import QuackCounter from '@/components/QuackCounter'
import { getQuackStats } from '@/lib/supabase/queries'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch quack stats for the user
  let quackStats = null
  try {
    quackStats = await getQuackStats(user.id)
  } catch (error) {
    console.error('Failed to fetch quack stats:', error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Welcome to Quack! 🦆</h1>
          <p className="text-lg text-gray-600">
            Signed in as <span className="font-mono text-sm">{user.email}</span>
          </p>
        </div>

        {/* Quack Counter */}
        <QuackCounter initialStats={quackStats} />

        {/* Stats Info */}
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-600">Last Activity</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {quackStats?.last_quack_at ? '✅ Active' : '⏳ Waiting'}
          </p>
        </div>

        {/* User Info & Logout */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">User ID:</p>
              <p className="break-all font-mono text-xs text-gray-800">{user.id}</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Keep quacking! The more you quack, the louder you become. 🦆</p>
        </div>
      </div>
    </div>
  )
}
