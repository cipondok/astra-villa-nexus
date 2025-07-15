import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment verification started");

    // Initialize Supabase with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    logStep("Session ID received", { sessionId });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent 
    });

    const bookingId = session.metadata?.bookingId;
    const bookingType = session.metadata?.bookingType as 'rental' | 'service';
    const userId = session.metadata?.userId;

    if (!bookingId || !bookingType || !userId) {
      throw new Error("Invalid session metadata");
    }

    // Update payment log
    await supabaseClient
      .from('payment_logs')
      .update({
        status: session.payment_status === 'paid' ? 'completed' : 'failed',
        response_data: {
          sessionId: session.id,
          paymentIntent: session.payment_intent,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total
        },
        updated_at: new Date().toISOString()
      })
      .eq('stripe_session_id', sessionId);

    logStep("Payment log updated");

    if (session.payment_status === 'paid') {
      // Update booking payment status
      const bookingTable = bookingType === 'rental' ? 'rental_bookings' : 'vendor_bookings';
      const { error: bookingUpdateError } = await supabaseClient
        .from(bookingTable)
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (bookingUpdateError) {
        logStep("Error updating booking", { error: bookingUpdateError });
        throw new Error(`Failed to update booking: ${bookingUpdateError.message}`);
      }

      logStep("Booking payment status updated", { bookingId, status: 'paid' });

      // Create payment record in booking_payments
      const { error: paymentError } = await supabaseClient
        .from('booking_payments')
        .insert({
          booking_id: bookingId,
          gateway_transaction_id: session.payment_intent as string,
          amount: (session.amount_total || 0) / 100, // Convert from cents
          currency: session.currency?.toUpperCase() || 'IDR',
          payment_method: 'stripe',
          payment_status: 'completed',
          payment_gateway: 'stripe',
          gateway_response: {
            sessionId: session.id,
            paymentIntent: session.payment_intent,
            customerEmail: session.customer_details?.email
          },
          processed_at: new Date().toISOString()
        });

      if (paymentError) {
        logStep("Error creating payment record", { error: paymentError });
      } else {
        logStep("Payment record created in booking_payments");
      }

      // Generate invoice (call invoice generation function)
      try {
        const invoiceResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
          },
          body: JSON.stringify({ bookingId, bookingType })
        });

        if (invoiceResponse.ok) {
          logStep("Invoice generation triggered");
        } else {
          logStep("Invoice generation failed", { status: invoiceResponse.status });
        }
      } catch (invoiceError) {
        logStep("Invoice generation error", { error: invoiceError });
      }

      return new Response(JSON.stringify({
        success: true,
        paymentStatus: 'completed',
        bookingId,
        message: 'Payment verified and booking updated successfully'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("Payment not completed", { paymentStatus: session.payment_status });
      
      return new Response(JSON.stringify({
        success: false,
        paymentStatus: session.payment_status,
        bookingId,
        message: 'Payment not completed'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});