# VOD Search Engine - Setup Guide

## Overview

This is a professional VOD search engine that transforms multi-hour stream VODs into searchable, AI-enhanced assets. It follows a decoupled architecture with Next.js frontend, n8n backend processing, and Supabase database.

## Prerequisites

- Node.js 22 LTS
- Docker and Docker Compose
- Supabase account and project
- OpenAI API key (for Whisper transcription)
- Google Gemini API key (for AI analysis)
- DigitalOcean account (for n8n hosting)

## 1. Database Setup

### Run Migrations

Execute the following SQL migrations in your Supabase SQL editor in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_row_level_security.sql`
3. `supabase/migrations/003_functions_and_triggers.sql`
4. `supabase/migrations/20241215_add_duration_hours.sql`
5. `supabase/migrations/20241215_add_processing_credits.sql`
6. `supabase/migrations/20241215_add_search_functions.sql`
7. `supabase/migrations/20250818_add_ai_features.sql`

### Verify Setup

Check that these tables exist:
- `profiles` (with processing_credits column)
- `vods` (with duration_hours and summary columns)
- `transcripts`
- `chapters`
- `viral_moments`

## 2. Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=your_sentry_dsn
RESEND_API_KEY=your_resend_api_key
```

### n8n Backend (.env)
```bash
N8N_PASSWORD=secure_password_here
N8N_ENCRYPTION_KEY=32_character_random_string
WEBHOOK_URL=https://your-frontend-domain.com/api/webhooks/n8n
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## 3. Install Dependencies

```bash
npm install
```

## 4. n8n Setup

### Start n8n Locally (for development)

```bash
cd /path/to/project
docker-compose up -d
```

Access n8n at http://localhost:5678 with admin/changeme

### Production Deployment

1. Create a DigitalOcean droplet
2. Install Docker and Docker Compose
3. Copy docker-compose.yml and .env file
4. Run `docker-compose up -d`

## 5. n8n Workflow Configuration

### Create the following workflow in n8n:

1. **Webhook Trigger**
   - HTTP Method: POST
   - Path: /webhook/vod-submit
   - Authentication: None (will validate JWT in workflow)

2. **JWT Verification**
   - Use HTTP Request node to verify JWT with Supabase

3. **Video Download**
   - Use HTTP Request node to download video from URL
   - Save to temporary storage

4. **Transcription (Whisper)**
   - Use OpenAI node with Whisper model
   - Process audio/video file
   - Save transcript segments with timestamps

5. **Transcript Storage**
   - Use Supabase node to insert transcripts
   - Update VOD status to 'completed'

6. **AI Analysis (Parallel)**
   - **Summary Generation**: Use Gemini to create VOD summary
   - **Chapter Detection**: Use Gemini to identify chapters
   - **Viral Moments**: Use Gemini to find engaging moments

7. **Results Storage**
   - Store summary in vods table
   - Store chapters in chapters table
   - Store viral moments in viral_moments table

8. **Status Update**
   - Update VOD status to 'completed'
   - Send webhook response to frontend

## 6. Frontend Development

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## 7. Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## 8. Testing

### Run Tests

```bash
npm test
```

### API Testing

Test the following endpoints:
- `POST /api/vod/submit` - Submit VOD
- `GET /api/vod/[id]/status` - Get VOD status
- `GET /api/vod/[id]/transcripts` - Get transcripts
- `GET /api/user/profile` - Get user profile and VODs

## 9. Monitoring

### Sentry Setup

Error monitoring is configured in `sentry.client.config.ts` and `sentry.server.config.ts`

### PostHog Setup

User analytics is configured in the frontend with PostHog

## 10. Troubleshooting

### Common Issues

1. **n8n Webhook Not Receiving Requests**
   - Check WEBHOOK_URL environment variable
   - Verify n8n is running and accessible
   - Check n8n logs: `docker-compose logs n8n`

2. **Supabase Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies are correct

3. **Video Processing Failures**
   - Check OpenAI API key and quota
   - Verify video URL accessibility
   - Check n8n workflow logs

4. **Credit Deduction Issues**
   - Verify user has sufficient credits
   - Check database functions
   - Review API logs

### Logs

- **Frontend**: Check browser console and Vercel logs
- **n8n**: `docker-compose logs n8n`
- **Supabase**: Check Supabase dashboard logs

## 11. Next Steps

1. Complete n8n workflow implementation
2. Test end-to-end VOD processing
3. Implement video player component
4. Add search functionality in workshop view
5. Implement Stripe integration (deferred)
6. Add team features (deferred)

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │      n8n        │    │   Supabase      │
│   Frontend      │◄───┤   Workflow      │◄───┤   Database      │
│   (Vercel)      │    │ (DigitalOcean)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
   User Dashboard         Video Processing         Data Storage
   VOD Submission         Transcription            Search Index
   Workshop View          AI Analysis              User Profiles
```

This setup provides a scalable, decoupled architecture that can handle video processing asynchronously while providing a responsive user experience.
