import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111] px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-[#fb607f] text-center mb-8">Dashboard</h1>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[#fb607f] mb-4">Welcome!</h2>
            <p className="text-white">You are logged in as:</p>
            <p className="text-white font-mono mt-1">{user.email}</p>
          </div>

          <div className="pt-4">
            <p className="text-white text-sm mb-2">User ID:</p>
            <p className="text-white font-mono text-xs break-all">{user.id}</p>
          </div>

          <div className="pt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
