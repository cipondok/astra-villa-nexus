import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency?: string;
  bookingType: 'rental' | 'service';
  successUrl?: string;
  cancelUrl?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment session creation started");

    // Initialize Supabase with service role for secure operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { bookingId, amount, currency = 'idr', bookingType, successUrl, cancelUrl }: PaymentRequest = await req.json();
    
    if (!bookingId || !amount || !bookingType) {
      throw new Error("Missing required fields: bookingId, amount, bookingType");
    }

    logStep("Payment request details", { bookingId, amount, currency, bookingType });

    // Verify booking exists and user has access
    const bookingTable = bookingType === 'rental' ? 'rental_bookings' : 'vendor_bookings';
    const { data: booking, error: bookingError } = await supabaseClient
      .from(bookingTable)
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }

    // Check if user is authorized (customer or vendor/agent)
    const userColumn = bookingType === 'rental' ? 'customer_id' : 'customer_id';
    if (booking[userColumn] !== user.id) {
      throw new Error("Unauthorized: User cannot access this booking");
    }

    logStep("Booking verified", { bookingId, userId: user.id });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check/create Stripe customer
    let customerId: string;
    const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    }

    // Create payment session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${bookingType === 'rental' ? 'Property Rental' : 'Service Booking'} - ${bookingId}`,
              metadata: {
                bookingId,
                bookingType,
                userId: user.id
              }
            },
            unit_amount: Math.round(amount * (currency.toLowerCase() === 'idr' ? 1 : 100)), // IDR vs USD/EUR
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/booking-cancelled`,
      metadata: {
        bookingId,
        bookingType,
        userId: user.id
      }
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Log payment attempt
    await supabaseClient
      .from('payment_logs')
      .insert({
        booking_id: bookingId,
        payment_method: 'stripe_checkout',
        amount: amount,
        currency: currency.toUpperCase(),
        stripe_session_id: session.id,
        status: 'initiated',
        response_data: { sessionId: session.id }
      });

    logStep("Payment log created");

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      url: session.url,
      success: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment-session", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});