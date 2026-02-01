/**
 * Auto-generated types for Supabase database schema
 * Update this file by running: supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 */

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quack_stats: {
        Row: {
          id: string;
          user_id: string;
          total_quacks: number;
          last_quack_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_quacks?: number;
          last_quack_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_quacks?: number;
          last_quack_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

/**
 * Type alias for UserProfile table row
 */
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

/**
 * Type alias for UserProfile insert
 */
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];

/**
 * Type alias for UserProfile update
 */
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

/**
 * Type alias for QuackStats table row
 */
export type QuackStats = Database['public']['Tables']['quack_stats']['Row'];

/**
 * Type alias for QuackStats insert
 */
export type QuackStatsInsert = Database['public']['Tables']['quack_stats']['Insert'];

/**
 * Type alias for QuackStats update
 */
export type QuackStatsUpdate = Database['public']['Tables']['quack_stats']['Update'];
