# Search VODs Edge Function

This Supabase Edge Function provides full-text search capabilities across video transcripts with proper authentication and authorization.

## Features

- **JWT Authentication**: Validates user authentication via Supabase Auth
- **Row Level Security**: Ensures users can only search their own transcripts
- **Full-Text Search**: Uses PostgreSQL's built-in text search capabilities
- **Relevance Ranking**: Calculates and returns relevance scores for results
- **Performance Optimized**: Limits results and includes search timing
- **CORS Support**: Handles cross-origin requests from the frontend

## API Specification

### Endpoint

```
POST /functions/v1/search-vods
```

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body

```json
{
  "query": "search terms",
  "vod_id": 123, // optional - search specific video
  "user_id": "uuid"
}
```

### Response

```json
{
  "results": [
    {
      "id": 1,
      "vod_id": 123,
      "user_id": "uuid",
      "content": "transcript content with search terms",
      "timestamp": 125.5,
      "created_at": "2024-01-01T00:00:00Z",
      "rank": 0.85
    }
  ],
  "query": "search terms",
  "total_results": 1,
  "search_time_ms": 45
}
```

### Error Responses

- `401 Unauthorized`: Invalid or missing JWT token
- `400 Bad Request`: Missing or invalid search query
- `403 Forbidden`: User ID mismatch
- `500 Internal Server Error`: Search execution failed

## Search Features

### Query Processing

- Sanitizes input to prevent SQL injection
- Removes special characters and normalizes whitespace
- Adds prefix matching for partial word searches
- Uses PostgreSQL's `websearch` configuration for natural language queries

### Relevance Scoring

- Calculates scores based on term frequency and position
- Earlier matches in content receive higher scores
- Results are sorted by relevance score (highest first)
- Includes position penalty for large result sets

### Performance Considerations

- Limited to 50 results per query to prevent large responses
- Includes search timing for performance monitoring
- Uses efficient PostgreSQL full-text search indexes

## Deployment

Deploy this function using the Supabase CLI:

```bash
supabase functions deploy search-vods
```

## Environment Variables

The function uses these Supabase environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Requirements

This function requires:

1. A `transcripts` table with full-text search index on the `content` column
2. Row Level Security (RLS) policies that restrict access to user's own data
3. Proper authentication setup in Supabase Auth

## Testing

Test the function locally:

```bash
supabase functions serve search-vods
```

Then make a request:

```bash
curl -X POST 'http://localhost:54321/functions/v1/search-vods' \
  -H 'Authorization: Bearer <your-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "test search",
    "user_id": "your-user-id"
  }'
```
