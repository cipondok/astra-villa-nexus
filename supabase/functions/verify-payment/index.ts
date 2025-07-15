import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { bookingId, paymentMethod = 'bank_transfer' } = await req.json();

    if (!bookingId) {
      throw new Error("Missing required parameter: bookingId");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update booking status to confirmed for bank transfer
    const { error: updateError } = await supabaseClient
      .from("rental_bookings")
      .update({
        payment_status: "pending_verification",
        booking_status: "confirmed",
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
        status: "pending_verification",
        response_data: {
          booking_id: bookingId,
          payment_method: paymentMethod
        },
        updated_at: new Date().toISOString()
      })
      .eq("booking_id", bookingId);

    if (logError) {
      console.error("Error updating payment log:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentStatus: "pending_verification",
        message: "Booking confirmed. Please complete bank transfer payment."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

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