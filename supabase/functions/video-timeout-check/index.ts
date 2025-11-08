import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

console.log("Video timeout check function started");

serve(async (_req) => {
  try {
    // Create Supabase client with service role key for full access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate the cutoff time (15 minutes ago)
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    console.log(`Checking for videos stuck in processing since before ${cutoffTime}`);

    // Find all videos with status 'processing' that were created before the cutoff time
    const { data: stuckVideos, error: fetchError } = await supabaseClient
      .from('generations')
      .select('id, user_id, created_at')
      .eq('status', 'processing')
      .lt('created_at', cutoffTime);

    if (fetchError) {
      console.error('Error fetching stuck videos:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stuck videos' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }

    console.log(`Found ${stuckVideos?.length || 0} videos stuck in processing`);

    // Update status to 'failed' for each stuck video
    let updatedCount = 0;
    if (stuckVideos && stuckVideos.length > 0) {
      for (const video of stuckVideos) {
        const { error: updateError } = await supabaseClient
          .from('generations')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);

        if (updateError) {
          console.error(`Error updating video ${video.id}:`, updateError);
        } else {
          console.log(`Updated video ${video.id} to failed status`);
          updatedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${stuckVideos?.length || 0} stuck videos, updated ${updatedCount} to failed status`
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  } catch (error) {
    console.error('Unexpected error in video timeout check:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});