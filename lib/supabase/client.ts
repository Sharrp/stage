/**
 * Supabase client utilities for browser environments
 * For Next.js SSR, use @supabase/ssr package
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Creates a Supabase client for client-side use (browser)
 * Uses @supabase/ssr's createBrowserClient for proper Next.js SSR support
 * Automatically handles cookie-based session management
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
