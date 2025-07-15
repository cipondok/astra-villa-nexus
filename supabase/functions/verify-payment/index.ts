import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, bookingId } = await req.json();

    if (!sessionId || !bookingId) {
      throw new Error("Missing required parameters: sessionId, bookingId");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    console.log('Session status:', session.payment_status);

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      // Update booking status
      const { error: updateError } = await supabaseClient
        .from("rental_bookings")
        .update({
          payment_status: "paid",
          booking_status: "confirmed",
          stripe_payment_intent_id: session.payment_intent,
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking:", updateError);
        throw updateError;
      }

      // Update payment log
      const { error: logError } = await supabaseClient
        .from("payment_logs")
        .update({
          status: "completed",
          response_data: {
            session_id: sessionId,
            payment_intent_id: session.payment_intent,
            amount_received: session.amount_total
          },
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", sessionId);

      if (logError) {
        console.error("Error updating payment log:", logError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentStatus: "paid",
          message: "Payment verified and booking confirmed"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );

    } else {
      // Payment failed or incomplete
      const { error: updateError } = await supabaseClient
        .from("rental_bookings")
        .update({
          payment_status: "failed",
          booking_status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking:", updateError);
      }

      // Update payment log
      const { error: logError } = await supabaseClient
        .from("payment_logs")
        .update({
          status: "failed",
          response_data: {
            session_id: sessionId,
            payment_status: session.payment_status
          },
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", sessionId);

      if (logError) {
        console.error("Error updating payment log:", logError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          paymentStatus: session.payment_status,
          message: "Payment verification failed"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to verify payment"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});