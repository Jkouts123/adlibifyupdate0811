import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

console.log("Store video function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Check if this is a multipart form data request (file upload)
    const contentType = req.headers.get('content-type') || '';
    
    let userId, generationId, videoBuffer, fileName;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      userId = formData.get('userId') as string;
      generationId = formData.get('generationId') as string;
      const videoFile = formData.get('videoFile') as File;
      
      if (!userId || !generationId || !videoFile) {
        return new Response(
          JSON.stringify({ error: "userId, generationId, and videoFile are required" }),
          { 
            status: 400, 
            headers: { 
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Convert file to ArrayBuffer
      videoBuffer = await videoFile.arrayBuffer();
      fileName = videoFile.name || `${generationId}-${Date.now()}.mp4`;
    } else {
      // Handle JSON request with URL
      const jsonData = await req.json();
      userId = jsonData.userId;
      generationId = jsonData.generationId;
      const videoUrl = jsonData.videoUrl;
      
      if (!userId || !generationId || !videoUrl) {
        return new Response(
          JSON.stringify({ error: "userId, generationId, and videoUrl are required" }),
          { 
            status: 400, 
            headers: { 
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Download the video from the provided URL
      console.log(`Downloading video from ${videoUrl}`);
      const videoResponse = await fetch(videoUrl);
      
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`);
      }
      
      videoBuffer = await videoResponse.arrayBuffer();
      fileName = `${generationId}-${Date.now()}.mp4`;
    }
    
    console.log(`Storing video for user ${userId}, generation ${generationId}`);
    
    // Create Supabase client with service role key for full access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log(`Video size: ${videoBuffer.byteLength} bytes`);
    console.log(`Storing video as ${fileName}`);
    
    // Upload to Supabase storage
    const { data, error } = await supabaseClient.storage
      .from('generated-videos')
      .upload(fileName, videoBuffer, {
        contentType: 'video/mp4',
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    
    console.log('Video uploaded successfully');
    
    // Get the public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('generated-videos')
      .getPublicUrl(fileName);
    
    console.log(`Video public URL: ${publicUrl}`);
    
    // Update the generation record with the video URL and status
    const { error: updateError } = await supabaseClient
      .from('generations')
      .update({ 
        video_url: publicUrl,
        status: 'completed',
        credits_used: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', generationId);
    
    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }
    
    console.log('Generation record updated');
    
    // Get current credits for the user
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw profileError;
    }
    
    // Deduct credit from user (only if they have credits)
    if (profileData.credits > 0) {
      const { error: creditError } = await supabaseClient
        .from('profiles')
        .update({ credits: profileData.credits - 1 })
        .eq('id', userId);
      
      if (creditError) {
        console.error('Credit deduction error:', creditError);
        throw creditError;
      }
      
      console.log(`Credit deducted. User now has ${profileData.credits - 1} credits`);
    } else {
      console.log('User has no credits to deduct');
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        videoUrl: publicUrl,
        message: 'Video stored successfully'
      }),
      { 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in store-video function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});