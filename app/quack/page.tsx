import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QuackCounter from '@/components/QuackCounter'
import { getQuackStats } from '@/lib/supabase/queries'
import Link from 'next/link'

export default async function QuackPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[600px] space-y-8">
        {/* Quack Counter */}
        <div className="flex justify-center">
          <QuackCounter initialStats={quackStats} />
        </div>

        {/* Back to Dashboard Link */}
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-accent-foreground transition-colors inline-flex items-center gap-2"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
