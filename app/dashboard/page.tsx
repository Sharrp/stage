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
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[600px] space-y-8">
        {/* User Info & Logout */}
        <div className="rounded-xl bg-card p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-base text-muted-foreground mb-2">
                Signed in as
              </p>
              <p className="text-xl font-semibold text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-3">User ID: <span className="font-mono">{user.id}</span></p>
            </div>
            <div className="flex justify-center pt-2">
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
            className="text-lg font-medium text-accent-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            Wanna 🦆?
          </Link>
        </div>
      </div>
    </div>
  )
}
