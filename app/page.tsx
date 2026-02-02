import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GoogleLoginButton from '@/components/GoogleLoginButton'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="text-center max-w-3xl">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-foreground tracking-tight leading-tight mb-12">
          Under const<span className="text-primary">r</span>uction
        </h1>

        {/* <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
          We&apos;re building something special. Sign in to get started.
        </p> */}

        <div className="flex justify-center mt-8">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  )
}
