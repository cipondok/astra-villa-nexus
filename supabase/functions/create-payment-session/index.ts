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
    const { bookingId, amount, currency = 'idr', customerEmail } = await req.json();

    if (!bookingId || !amount || !customerEmail) {
      throw new Error("Missing required parameters: bookingId, amount, customerEmail");
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

    // Fetch booking details for line items
    const { data: booking, error: bookingError } = await supabaseClient
      .from("rental_bookings")
      .select(`
        *,
        properties:property_id (
          title,
          location,
          city
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: booking.customer_name,
        phone: booking.customer_phone,
      });
      customerId = customer.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Property Rental - ${booking.properties.title}`,
              description: `${booking.total_days} days rental at ${booking.properties.location}`,
            },
            unit_amount: Math.round(amount), // Stripe expects amount in smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${req.headers.get("origin")}/booking-cancel?booking_id=${bookingId}`,
      metadata: {
        booking_id: bookingId,
        customer_email: customerEmail,
      },
    });

    // Update booking with payment session ID
    const { error: updateError } = await supabaseClient
      .from("rental_bookings")
      .update({
        stripe_session_id: session.id,
        payment_status: "processing",
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking with session ID:", updateError);
    }

    // Log payment attempt
    const { error: logError } = await supabaseClient
      .from("payment_logs")
      .insert({
        booking_id: bookingId,
        payment_method: "stripe",
        amount: amount,
        currency: currency,
        stripe_session_id: session.id,
        status: "initiated",
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error("Error logging payment attempt:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url,
        sessionId: session.id,
        message: "Payment session created successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create payment session"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});