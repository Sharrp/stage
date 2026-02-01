# Authentication Testing

## Test Suite Overview

Comprehensive test coverage for Supabase authentication functionality.

**Total: 36 tests across 5 test files**

## Test Files

### 1. `app/page.test.tsx` (13 tests)
Tests for the homepage with Google OAuth authentication.

**Basic Rendering (5 tests):**
- ✅ Renders without crashing
- ✅ Displays "Under construction" heading
- ✅ Displays exact text
- ✅ Applies correct styling classes
- ✅ Has accessible heading structure

**Authentication - Not Logged In (4 tests):**
- ✅ Shows Google sign-in button when not authenticated
- ✅ Google sign-in button has correct styling (pink #fb607f)
- ✅ Calls `signInWithOAuth` when button is clicked
- ✅ Disables button while signing in

**Authentication - Logged In (2 tests):**
- ✅ Redirects to dashboard when user is authenticated
- ✅ Does not show sign-in button when authenticated

**Auth State Changes (2 tests):**
- ✅ Sets up auth state listener on mount
- ✅ Redirects to dashboard when user logs in

### 2. `app/dashboard/page.test.tsx` (7 tests)
Tests for the protected dashboard page.

**When Not Authenticated (1 test):**
- ✅ Redirects to homepage (/) when user is not authenticated

**When Authenticated (6 tests):**
- ✅ Renders dashboard when user is authenticated
- ✅ Displays user email
- ✅ Displays user ID
- ✅ Shows welcome message
- ✅ Renders logout button
- ✅ Has correct styling classes (pink title)

### 3. `lib/supabase/client.test.ts` (5 tests)
Tests for Supabase client initialization.

- ✅ Creates a Supabase browser client
- ✅ Initializes with correct Supabase URL
- ✅ Initializes with correct anon key
- ✅ Uses environment variables from process.env
- ✅ Returns a client with auth methods (signInWithOAuth, signOut, getUser, onAuthStateChange)

### 4. `app/auth/callback/route.test.ts` (6 tests)
Tests for OAuth callback handler.

- ✅ Exchanges code for session when code is provided
- ✅ Redirects to dashboard on successful authentication
- ✅ Uses custom next parameter for redirect
- ✅ Redirects to login with error when code exchange fails
- ✅ Redirects to login with error when no code is provided
- ✅ Preserves origin in redirect URL

### 5. `app/api/health/route.test.ts` (5 tests)
Existing health check endpoint tests (unrelated to auth).

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

### Components Tested
- ✅ Homepage (with auth state)
- ✅ Dashboard page
- ✅ OAuth callback handler
- ✅ Supabase client initialization

### Features Tested
- ✅ Google OAuth sign-in flow
- ✅ Redirect logic (authenticated/unauthenticated)
- ✅ Auth state management
- ✅ Protected route behavior
- ✅ UI rendering based on auth state
- ✅ Proper styling (pink accents, white text)

## Mocking Strategy

### Supabase Client Mock
```typescript
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))
```

### Next.js Router Mock
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  redirect: (path: string) => mockRedirect(path),
}))
```

## Key Test Scenarios

### 1. Unauthenticated User Flow
```
Homepage → See Google button → Click → OAuth redirect
```

### 2. Authenticated User Flow
```
Homepage → Auto-redirect to dashboard → See user info
```

### 3. Protected Route Access
```
Visit /dashboard → Not authenticated → Redirect to /
```

### 4. OAuth Callback
```
Google OAuth → Return with code → Exchange for session → Redirect to dashboard
```

## Test Results

```
✓ lib/supabase/client.test.ts (5 tests)
✓ app/auth/callback/route.test.ts (6 tests)
✓ app/api/health/route.test.ts (5 tests)
✓ app/dashboard/page.test.tsx (7 tests)
✓ app/page.test.tsx (13 tests)

Test Files: 5 passed (5)
Tests: 36 passed (36)
Duration: ~1.8s
```

## Notes

- Tests use Vitest with jsdom environment
- Components are tested with React Testing Library
- All async operations are properly handled with `waitFor`
- Mocks are cleared between tests to ensure isolation
- Tests verify both behavior and UI styling
