import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Price IDs to credit amounts
const PRICE_TO_CREDITS: Record<string, number> = {
  "price_1SN41FDuF4e9ixnRPCvgrLSl": 30,   // Starter pack - 30 credits
  "price_1SN41VDuF4e9ixnRnrcvMDI4": 100,  // Pro pack - 100 credits
  "price_1SN41lDuF4e9ixnRsGjx6QXX": 250,  // Business pack - 250 credits
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Log that we're processing this session
    console.log(`Processing payment for session: ${sessionId}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = session.metadata?.user_id;
    const priceId = session.metadata?.price_id;
    
    if (!userId || !priceId) {
      throw new Error("Invalid session metadata");
    }

    const creditsToAdd = PRICE_TO_CREDITS[priceId];
    
    if (!creditsToAdd) {
      throw new Error("Invalid price ID");
    }

    // Get current credits
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Log current credits and credits to add
    console.log(`User ${userId} currently has ${profile.credits} credits, adding ${creditsToAdd} credits`);

    // Check if credits have already been added (simple check to prevent duplicate processing)
    // We'll check if the user's credits are already at the expected level
    const expectedCredits = profile.credits + creditsToAdd;
    
    // Get the session creation time from Stripe to help with duplicate detection
    const sessionCreated = session.created;
    const timeThreshold = 300; // 5 minutes in seconds
    
    // Check if there's a recent record of this user having the expected credits
    const { data: recentProfiles } = await supabaseClient
      .from("profiles")
      .select("credits, updated_at")
      .eq("id", userId)
      .gte("updated_at", new Date((sessionCreated - timeThreshold) * 1000).toISOString())
      .order("updated_at", { ascending: false })
      .limit(1);

    if (recentProfiles && recentProfiles.length > 0) {
      const recentProfile = recentProfiles[0];
      // If the user already has the expected credits, they might have been added already
      if (recentProfile.credits === expectedCredits) {
        console.log(`Credits already added for user ${userId}, skipping duplicate processing`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            creditsAdded: 0,
            totalCredits: expectedCredits,
            message: "Credits already processed"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Add credits
    const newCredits = profile.credits + creditsToAdd;
    const { error } = await supabaseClient
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", userId);

    if (error) throw error;

    // Log the successful update
    console.log(`Successfully updated credits for user ${userId} to ${newCredits}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        creditsAdded: creditsToAdd,
        totalCredits: newCredits
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
