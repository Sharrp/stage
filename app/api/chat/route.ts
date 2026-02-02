/**
 * API route for sending chat messages
 * POST /api/chat - Send a message and get a sarcastic rhyming response
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { sendChatMessage } from '@/lib/openrouter/client';

/**
 * Validates JWT token and extracts user ID
 */
async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    return user?.id || null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

interface ChatRequestBody {
  message: string;
}

interface ChatResponse {
  userMessage: string;
  assistantMessage: string;
  updatedAt: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse | ErrorResponse>> {
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

    // Parse request body
    let requestBody: ChatRequestBody;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // Validate message field exists
    if (requestBody.message === undefined || requestBody.message === null) {
      return NextResponse.json(
        { error: 'Message field is required', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // Validate message type
    if (typeof requestBody.message !== 'string') {
      return NextResponse.json(
        { error: 'Message must be a string', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // Validate message length (1-50 characters)
    const message = requestBody.message.trim();
    if (message.length < 1 || message.length > 50) {
      return NextResponse.json(
        { error: 'Message must be between 1 and 50 characters', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // Call OpenRouter to get assistant response
    const assistantMessage = await sendChatMessage(message);

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

    const now = new Date().toISOString();

    // Upsert chat message (update if exists, insert if not)
    const { data: chatData, error: chatError } = await (supabase
      .from('chat_messages') as any)
      .upsert(
        {
          user_id: userId,
          user_message: message,
          assistant_message: assistantMessage,
          updated_at: now,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (chatError) {
      console.error('Chat message upsert error:', chatError);
      throw new Error(`Failed to store chat message: ${chatError.message}`);
    }

    return NextResponse.json({
      userMessage: chatData.user_message,
      assistantMessage: chatData.assistant_message,
      updatedAt: chatData.updated_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in chat API:', message);

    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
