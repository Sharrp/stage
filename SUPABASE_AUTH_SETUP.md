# Supabase Authentication Setup

## Overview
This Next.js app now has complete Supabase authentication with Google OAuth.

## Files Created

### Environment Configuration
- `.env.example` - Template with placeholder environment variables
- `.env.local` - Actual Supabase credentials (gitignored)

### Supabase Client Utilities
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client with cookie handling for server components
- `lib/supabase/middleware.ts` - Auth session management for middleware

### Authentication Pages
- `app/auth/callback/route.ts` - OAuth callback handler
- `app/dashboard/page.tsx` - Protected dashboard (requires authentication)
- `app/dashboard/LogoutButton.tsx` - Logout button component
- `app/LogoutButton.tsx` - Logout button for homepage

### Middleware
- `middleware.ts` - Protects /dashboard route and refreshes auth sessions

### Updated Files
- `app/page.tsx` - Homepage is now a client component with Google OAuth button (shows Sign in with Google button when not authenticated, or Dashboard/Logout when authenticated)

## Features

1. **Google OAuth Authentication**
   - One-click sign in with Google directly from homepage
   - No separate login or signup pages needed - everything on homepage
   - Secure OAuth 2.0 flow

2. **OAuth Callback Handler**
   - `/auth/callback` route handles the OAuth redirect
   - Exchanges authorization code for session
   - Redirects to dashboard after successful authentication

3. **Protected Routes**
   - `/dashboard` is protected and redirects to `/login` if not authenticated
   - Middleware automatically refreshes user sessions

4. **Auth-Aware UI**
   - Homepage shows Google sign-in button only when not authenticated
   - Logged-in users are automatically redirected to dashboard
   - Clean, consistent styling using Tailwind CSS
   - Google-branded sign-in button with official logo
   - White base text on dark background, pink accent for titles

5. **Session Management**
   - Automatic session refresh via middleware
   - Secure cookie-based session storage
   - Logout functionality available on homepage and dashboard

## How to Test

1. **Configure Supabase (IMPORTANT):**

   Before testing, you need to configure Google OAuth in your Supabase dashboard:

   a. Go to your Supabase project: https://app.supabase.com/project/bxjuuvxdxwwoiidskdbk

   b. Navigate to: **Authentication → Providers → Google**

   c. Enable Google provider and add your OAuth credentials:
      - Get credentials from: https://console.cloud.google.com/apis/credentials
      - Add authorized redirect URI: `https://bxjuuvxdxwwoiidskdbk.supabase.co/auth/v1/callback`

   d. Add your site URL in **Authentication → URL Configuration:**
      - Site URL: `http://localhost:3000` (for development)
      - Redirect URLs: `http://localhost:3000/auth/callback`

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Visit http://localhost:3000**
   - You should see the homepage with "Sign in with Google" button
   - If you're already logged in, you'll be automatically redirected to dashboard

4. **Sign in with Google:**
   - Click "Sign in with Google" on the homepage
   - You'll be redirected to Google's OAuth page
   - Authorize the application
   - You'll be automatically redirected to `/dashboard`

5. **Homepage behavior:**
   - Not logged in: Shows "Sign in with Google" button
   - Logged in: Automatically redirects to `/dashboard`

6. **Protected route:**
   - Try accessing `/dashboard` without being logged in
   - You'll be redirected to homepage (/)

7. **Logout:**
   - Click the "Logout" button on the dashboard
   - You'll be redirected to the homepage and see the sign-in button

## Supabase Configuration

The app is configured to connect to:
- **URL:** https://bxjuuvxdxwwoiidskdbk.supabase.co
- **Anon Key:** (stored in .env.local)

**Required Configuration in Supabase:**

1. **Enable Google OAuth Provider:**
   - Go to Authentication → Providers → Google
   - Toggle "Enable Sign in with Google"
   - Add your Google OAuth credentials (Client ID and Client Secret)

2. **Configure Redirect URLs:**
   - Go to Authentication → URL Configuration
   - Add to "Redirect URLs": `http://localhost:3000/auth/callback`
   - For production, add: `https://yourdomain.com/auth/callback`

3. **Get Google OAuth Credentials:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://bxjuuvxdxwwoiidskdbk.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## Testing

Comprehensive test suite with 36 tests covering:
- Homepage authentication UI
- Dashboard protected route behavior
- OAuth callback handling
- Supabase client initialization

Run tests:
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:ui         # UI mode
npm run test:coverage   # With coverage
```

See `TESTING_AUTH.md` for detailed test documentation.

## Security Notes

- The `.env.local` file is gitignored and won't be committed
- Use `.env.example` as a template for other developers
- Never commit actual API keys to version control
- The anon key is safe to use in client-side code (it's public)

## Styling

All pages use consistent styling:
- Dark background (#111)
- White base text color for readability
- Pink accent color (#fb607f) for titles and highlights
- White Google sign-in button with official Google branding
- Clean, minimal design
- Responsive layout with Tailwind CSS

## Architecture

**OAuth Flow:**
1. User visits homepage (/)
2. If logged in: Automatically redirected to `/dashboard`
3. If not logged in: Shown "Sign in with Google" button
4. User clicks button → `signInWithOAuth()` redirects to Google's OAuth consent screen
5. User authorizes the app
6. Google redirects back to `/auth/callback?code=...`
7. Callback route exchanges code for session using `exchangeCodeForSession()`
8. User is redirected to `/dashboard` with active session
9. Middleware maintains session across page navigations

**Page Structure:**
- `/` - Homepage (client component with Google OAuth button, auto-redirects if logged in)
- `/dashboard` - Protected page (server component, redirects to / if not authenticated)
- `/auth/callback` - OAuth callback handler (server route)

**Redirect Logic:**
- Homepage: If logged in → redirect to `/dashboard`
- Dashboard: If not logged in → redirect to `/` (homepage)
- Middleware: If accessing `/dashboard` without auth → redirect to `/`
