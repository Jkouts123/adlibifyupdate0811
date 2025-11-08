// Follow this style guide: https://deno.com/manual@v1.35.2/typescript/style_guide
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

console.log("n8n proxy function started");

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
    // Get the webhook URL and payload from the request
    const { webhookUrl, payload } = await req.json();
    
    if (!webhookUrl || !payload) {
      return new Response(
        JSON.stringify({ error: "webhookUrl and payload are required" }),
        { 
          status: 400, 
          headers: { 
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Forward the request to the n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        }, 
        status: 200 
      }
    );
  } catch (error) {
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