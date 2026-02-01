/**
 * API route for incrementing quack count
 * POST /api/quack - Increment quack count for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database, QuackStats } from '@/lib/supabase/database.types';

/**
 * Validates JWT token and extracts user ID
 * This is a simplified approach - in production, use proper JWT verification
 */
async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    // Create a temporary client to verify the user's token
    const supabase = await createClient();

    // Use the token to get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    return user?.id || null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

interface QuackRequestBody {
  userId?: string;
}

interface QuackResponse extends QuackStats {}

interface ErrorResponse {
  error: string;
  code?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<QuackResponse | ErrorResponse>> {
  try {
    // Extract authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user ID
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Optional: Validate request body userId matches authenticated user
    let requestBody: QuackRequestBody = {};
    try {
      requestBody = await request.json();
    } catch {
      // Body is optional, continue with authenticated user
    }

    // Ensure userId matches authenticated user (security check)
    if (requestBody.userId && requestBody.userId !== userId) {
      return NextResponse.json(
        { error: 'User ID mismatch', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Create a Supabase client with the user's access token for proper RLS context
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the token and get user info
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unable to verify user', code: 'AUTH_ERROR' },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();

    // Ensure user_profiles record exists (for users created before trigger)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          email: user.email || null,
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          updated_at: now,
        },
        {
          onConflict: 'id',
        }
      );

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    // Get current quack count
    const { data: currentStats } = await supabase
      .from('quack_stats')
      .select('total_quacks')
      .eq('user_id', userId)
      .single();

    const newCount = (currentStats?.total_quacks ?? 0) + 1;

    // Upsert quack stats
    const { data: updatedStats, error: upsertError } = await supabase
      .from('quack_stats')
      .upsert(
        {
          user_id: userId,
          total_quacks: newCount,
          last_quack_at: now,
          updated_at: now,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      throw new Error(`Failed to increment quack count: ${upsertError.message}`);
    }

    return NextResponse.json(updatedStats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error incrementing quack count:', message);

    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quack - Fetch quack stats for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Extract authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user ID
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Import getQuackStats here to avoid circular dependency
    const { getQuackStats } = await import('@/lib/supabase/queries');
    const stats = await getQuackStats(userId);

    if (!stats) {
      return NextResponse.json(
        { error: 'Quack stats not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error fetching quack stats:', message);

    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
