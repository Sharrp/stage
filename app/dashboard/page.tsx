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
    quackStats = await getQuackStats(supabase, user.id)
  } catch (error) {
    console.error('Failed to fetch quack stats:', error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      <div className="w-full max-w-[500px] space-y-8">
        {/* Quack Counter */}
        <div className="flex justify-center">
          <QuackCounter initialStats={quackStats} />
        </div>

        {/* User Info & Logout */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-4">
            <div>
              <p className="text-lg text-gray-600">
                Signed in as <span className="font-mono text-sm">{user.email}</span>
              </p>
              <p className="text-sm text-gray-600">User ID: <span className="font-mono text-xs text-gray-800">{user.id}</span></p>
            </div>
            <div className="flex justify-center">
              <LogoutButton />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
