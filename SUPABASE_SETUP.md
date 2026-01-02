# Supabase Setup Guide

This guide explains how to set up Supabase for the Lamentix Music Streaming application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details:
   - Name: `lamentix-music`
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
4. Wait for the project to be created (takes ~2 minutes)

## Step 2: Run Database Schema

1. In your Supabase project dashboard, go to "SQL Editor"
2. Open the file `supabase/schema.sql` from this project
3. Copy the entire SQL content
4. Paste it into the SQL Editor in Supabase
5. Click "Run" to execute the schema

This will create:
- `users` table
- `categories` table (with default categories)
- `tracks` table
- `podcasts` table
- `playlists` table
- `playlist_tracks` junction table
- `user_favorites` table
- Indexes and triggers

## Step 3: Get API Keys

1. In your Supabase project dashboard, go to "Settings" → "API"
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

## Step 4: Configure Backend

1. Create a `.env` file in the `backend` directory (if it doesn't exist)
2. Add the following:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# JioSaavn API (Optional)
JIOSAAVN_API_URL=http://localhost:3001/api
```

Replace the values with your actual Supabase credentials.

## Step 5: Install Dependencies

```bash
cd lamentix-music-streaming/backend
npm install
```

This will install `@supabase/supabase-js` along with other dependencies.

## Step 6: Test Connection

1. Start the backend server:
```bash
npm run dev
```

2. Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Lamentix API is running",
  "database": "Supabase connected"
}
```

## Step 7: Test APIs with Postman

### Test GET /api/categories

**Request:**
```
GET http://localhost:5000/api/categories
```

**Expected Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "uuid",
      "name": "Pop",
      "description": "Popular music",
      "image_url": "",
      "created_at": "2024-01-01T00:00:00Z"
    },
    ...
  ]
}
```

### Test GET /api/tracks

**Request:**
```
GET http://localhost:5000/api/tracks?limit=10&page=1
```

**Expected Response:**
```json
{
  "success": true,
  "tracks": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

### Test GET /api/podcasts

**Request:**
```
GET http://localhost:5000/api/podcasts?limit=10&page=1
```

**Expected Response:**
```json
{
  "success": true,
  "podcasts": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

## Step 8: Add Sample Data (Optional)

You can add sample tracks and podcasts using the API:

### Add a Track

**Request:**
```
POST http://localhost:5000/api/tracks
Content-Type: application/json

{
  "title": "Sample Song",
  "artist": "Sample Artist",
  "album": "Sample Album",
  "genre": "Pop",
  "duration": 180,
  "audio_url": "https://example.com/song.mp3",
  "cover_image": "https://example.com/cover.jpg"
}
```

### Add a Podcast

**Request:**
```
POST http://localhost:5000/api/podcasts
Content-Type: application/json

{
  "title": "Sample Podcast",
  "host": "Sample Host",
  "description": "A sample podcast",
  "category": "General",
  "duration": 3600,
  "audio_url": "https://example.com/podcast.mp3",
  "cover_image": "https://example.com/podcast.jpg"
}
```

## Row Level Security (RLS)

By default, Supabase enables Row Level Security. You may need to configure RLS policies:

1. Go to "Authentication" → "Policies" in Supabase dashboard
2. For each table, you can set policies like:
   - `SELECT` - Allow public read access
   - `INSERT` - Allow authenticated users only
   - `UPDATE` - Allow users to update their own records
   - `DELETE` - Allow users to delete their own records

For development, you can temporarily disable RLS, but for production, proper policies are recommended.

## Troubleshooting

### Connection Errors

- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active
- Ensure you've run the schema SQL

### API Errors

- Check the backend console for error messages
- Verify RLS policies allow the operations you're trying to perform
- Check that table names match exactly (case-sensitive)

### Data Not Appearing

- Verify data was inserted correctly in Supabase dashboard
- Check RLS policies
- Verify the query filters are correct

## Next Steps

- Set up authentication (see auth routes)
- Configure RLS policies for production
- Add more sample data
- Test the frontend integration

