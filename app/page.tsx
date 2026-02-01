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
    <div className="flex min-h-screen items-center justify-center bg-[#111] px-4">
      <div className="text-center">
        <h1 className="text-7xl md:text-[10rem] lg:text-[12rem] font-bold text-white tracking-wider uppercase leading-tight mb-12">
          Under const<span className="text-[#fb607f]">r</span>uction
        </h1>

        <div className="flex justify-center mt-8">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  )
}
