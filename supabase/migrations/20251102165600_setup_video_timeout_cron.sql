-- Setup cron job for video timeout check
-- This will run every 5 minutes to check for videos stuck in processing status

-- First, make sure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the video timeout check function to run every 5 minutes
SELECT 
  cron.schedule(
    'video-timeout-check', -- job name
    '*/5 * * * *', -- every 5 minutes
    $$SELECT net.http_post(
      url:='https://uxycuaydoxccvoimogah.supabase.co/functions/v1/video-timeout-check',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eWN1YXlkb3hjY3ZvaW1vZ2FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTY2NDI4MywiZXhwIjoyMDc3MjQwMjgzfQ.T7bC8ZUa8J3qV3gZ2Zq2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z"}'
    )$$
  );