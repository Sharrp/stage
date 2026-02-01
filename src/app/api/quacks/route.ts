/**
 * API route for quack operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { incrementQuackCount } from '@/lib/supabase/queries';

/**
 * POST /api/quacks - Increment quack count for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user ID (in a real app, verify the token properly)
    // For now, we'll assume the token contains the user ID or you verify it
    // This is a simplified version - in production, verify the JWT token
    let userId: string;
    try {
      // Extract user ID from the request body (passed by client)
      const body = await request.json();
      userId = body.userId;

      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Increment quack count
    const updatedStats = await incrementQuackCount(userId);

    return NextResponse.json(updatedStats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error incrementing quack count:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
