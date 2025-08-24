# Database Setup Guide

This guide will help you set up the database schema for the VOD Search Engine application.

## Prerequisites

1. A Supabase project created at [supabase.com](https://supabase.com)
2. Access to your Supabase project's SQL editor or CLI

## Setup Methods

### Method 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Click "Run" to execute the script

### Method 2: Using Supabase CLI

1. Install the Supabase CLI:

   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project:

   ```bash
   supabase init
   ```

3. Link to your remote project:

   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. Run the migrations:
   ```bash
   supabase db push
   ```

### Method 3: Manual Migration Files

Run each migration file in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates tables and indexes
2. `supabase/migrations/002_row_level_security.sql` - Sets up RLS policies
3. `supabase/migrations/003_functions_and_triggers.sql` - Creates utility functions

## Database Schema

### Tables

#### `profiles`

- Stores user profile information
- Automatically created when a user signs up
- Links to Supabase auth.users table

#### `vods`

- Stores video-on-demand submissions
- Tracks processing status (pending, processing, completed, failed)
- Links to user profiles

#### `transcripts`

- Stores transcript segments for each VOD
- Includes content text and timestamp information
- Supports full-text search

### Security Features

#### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- Users can only access their own data
- Transcripts are only accessible if the user owns the associated VOD
- All operations (SELECT, INSERT, UPDATE, DELETE) are properly secured

#### Indexes

Optimized indexes for:

- User lookups
- VOD status filtering
- Timestamp-based sorting
- Full-text search on transcript content

### Utility Functions

#### `search_transcripts(search_query, vod_id, user_id)`

- Performs full-text search on transcript content
- Returns ranked results with relevance scores
- Respects RLS policies

#### `get_vod_stats(vod_id)`

- Returns statistics for a specific VOD
- Includes transcript count and total duration
- Secured by RLS

#### `update_vod_status(vod_id, new_status)`

- Updates VOD processing status
- Validates status values
- Secured by RLS

## Environment Variables

After setting up the database, make sure to configure your environment variables:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the Setup

1. Create a test user through your application's signup flow
2. The `profiles` table should automatically get a new record
3. Try creating a VOD and verify RLS is working correctly
4. Test the search functionality with sample transcript data

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**

   - Ensure you're authenticated when testing
   - Check that `auth.uid()` returns the expected user ID

2. **Full-text Search Not Working**

   - Verify the GIN index was created successfully
   - Check that the search query format is correct

3. **Triggers Not Firing**
   - Ensure the trigger functions were created successfully
   - Check Supabase logs for any error messages

### Getting Help

- Check the Supabase documentation: https://supabase.com/docs
- Review the application logs for detailed error messages
- Verify your environment variables are correctly set

## Development vs Production

- The seed data in `supabase/seed.sql` should only be used in development
- Always test RLS policies thoroughly before deploying to production
- Consider setting up separate Supabase projects for development and production
