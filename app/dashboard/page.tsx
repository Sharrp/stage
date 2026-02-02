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
    <div className="relative min-h-screen bg-background px-6 py-12">
      {/* User Info & Logout - Top Left */}
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {user.email}
        </div>
        <LogoutButton />
      </div>

      {/* Main Content - Centered */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-[600px] space-y-8">
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
    </div>
  )
}
