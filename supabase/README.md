# Supabase Migrations

This directory contains SQL migration files for the Supabase database schema.

## Running Migrations

### Local Development

To run migrations locally with the Supabase CLI:

```bash
supabase migration up
```

Or push all migrations at once:

```bash
supabase db push
```

### Production

Migrations are typically run automatically during your deployment process. However, you can manually run migrations using the Supabase dashboard:

1. Go to your project dashboard on supabase.com
2. Navigate to the SQL Editor
3. Click "New Query"
4. Copy the contents of the migration file and execute

Or use the Supabase CLI:

```bash
supabase migration up --linked
```

## Migration Files

- **001_initial_schema.sql** - Initial database schema with user profiles and quack stats tables, RLS policies, and trigger functions
- **002_add_user_profiles_insert_policy.sql** - Adds INSERT RLS policy for user_profiles table
- **003_chat_messages.sql** - Chat messages table with one message per user, message length validation, and automatic updated_at tracking

## Schema Overview

### Tables

- **user_profiles**: Stores user profile information, linked to Supabase auth users
- **quack_stats**: Tracks user quack statistics and activity
- **chat_messages**: Stores chat conversation messages (one per user). Contains user message (max 50 characters) and assistant message with automatic timestamp tracking

### Security

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Adding New Migrations

Create new migration files with the naming convention: `NNN_description.sql` where NNN is an incrementing number.

```bash
supabase migration new add_new_feature
```

This will create a new migration file that you can edit.
