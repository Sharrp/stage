/**
 * Database query functions for Supabase
 */

import { createClient } from './client';
import type { UserProfile, QuackStats } from './database.types';

/**
 * Fetches the user profile for a given user ID
 * @param userId - The user's UUID from auth.users
 * @returns The user profile or null if not found
 * @throws Error if the database query fails
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}

/**
 * Fetches the quack stats for a given user
 * @param userId - The user's UUID
 * @returns The quack stats or null if not found
 * @throws Error if the database query fails
 */
export async function getQuackStats(userId: string): Promise<QuackStats | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('quack_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch quack stats: ${error.message}`);
  }

  return data;
}

/**
 * Increments the quack count for a user and updates the last quack timestamp
 * @param userId - The user's UUID
 * @returns The updated quack stats
 * @throws Error if the update fails
 */
export async function incrementQuackCount(userId: string): Promise<QuackStats> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const supabase = createClient();
  const now = new Date().toISOString();

  // Get current quack count
  const { data: currentStats, error: fetchError } = await supabase
    .from('quack_stats')
    .select('total_quacks')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch current quack stats: ${fetchError.message}`);
  }

  const newCount = (currentStats?.total_quacks ?? 0) + 1;

  // Update quack stats
  const { data, error } = await supabase
    .from('quack_stats')
    .update({
      total_quacks: newCount,
      last_quack_at: now,
      updated_at: now,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to increment quack count: ${error.message}`);
  }

  return data;
}
