import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

async function getLastChatMessage(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ userMessage: string; assistantMessage: string } | null> {
  const { data, error } = await (supabase.from('chat_messages') as any)
    .select('user_message, assistant_message')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows
    throw error
  }

  return {
    userMessage: data.user_message,
    assistantMessage: data.assistant_message,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const lastMessage = await getLastChatMessage(supabase, user.id)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      <div className="w-full max-w-[500px] space-y-8 relative">
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

        {/* Chat Interface */}
        <ChatInterface initialMessage={lastMessage} />

        {/* Quack Link - Bottom Right */}
        <div className="flex justify-end">
          <Link
            href="/quack"
            className="text-lg font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            Wanna 🦆?
          </Link>
        </div>
      </div>
    </div>
  )
}
