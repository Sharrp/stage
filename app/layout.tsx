import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { WorkflowProvider } from '@/lib/context'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pricing Decision Assistant',
  description: 'AI-assisted decision support for complex pricing changes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-gray-900">
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <WorkflowProvider>
            {children}
          </WorkflowProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
