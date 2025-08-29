# Environment Variables Configuration

## Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=your_sentry_dsn
RESEND_API_KEY=your_resend_api_key

## n8n Backend (.env for docker-compose)
N8N_PASSWORD=secure_password_here
N8N_ENCRYPTION_KEY=32_character_random_string
WEBHOOK_URL=https://your-frontend-domain.com/api/webhooks/n8n
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

## Supabase (set in Supabase dashboard)
# These are set in your Supabase project settings
# SUPABASE_URL - from project settings
# SUPABASE_ANON_KEY - from project API keys
# SUPABASE_SERVICE_ROLE_KEY - from project API keys (secret)

## Deployment
VERCEL_URL=your_vercel_deployment_url
DIGITALOCEAN_DROPLET_IP=your_droplet_ip_address
