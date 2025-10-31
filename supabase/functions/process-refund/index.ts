import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const refundRequestSchema = z.object({
  bookingId: z.string().uuid({ message: "Invalid booking ID format" }),
  amount: z.number()
    .positive({ message: "Refund amount must be positive" })
    .max(100000000, { message: "Refund amount exceeds maximum" })
    .optional(),
  reason: z.string()
    .max(500, { message: "Reason must be less than 500 characters" })
    .optional(),
  bookingType: z.enum(['rental', 'service'], { errorMap: () => ({ message: "Invalid booking type" }) }),
});

type RefundRequest = z.infer<typeof refundRequestSchema>;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REFUND] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Refund processing started");

    // Initialize Supabase with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user (admin or authorized user)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Verify user has admin or customer_service role using the has_role function
    const { data: isAdmin, error: adminCheckError } = await supabaseClient
      .rpc('has_role', { 
        _user_id: user.id, 
        _role: 'admin' 
      });

    const { data: isCustomerService, error: csCheckError } = await supabaseClient
      .rpc('has_role', { 
        _user_id: user.id, 
        _role: 'customer_service' 
      });

    if (adminCheckError || csCheckError) {
      logStep("Error checking user roles", { adminCheckError, csCheckError });
      throw new Error("Failed to verify user permissions");
    }

    if (!isAdmin && !isCustomerService) {
      throw new Error("Unauthorized: Only admins or customer service can process refunds");
    }

    logStep("Authorized user verified", { userId: user.id, isAdmin, isCustomerService });

    // Parse and validate request body
    const requestBody = await req.json();
    const validationResult = refundRequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errors}`);
    }
    
    const { bookingId, amount, reason = 'Requested by admin', bookingType } = validationResult.data;

    logStep("Refund request validated", { bookingId, amount, reason, bookingType });

    // Get payment information
    const { data: payment, error: paymentError } = await supabaseClient
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('payment_status', 'completed')
      .single();

    if (paymentError || !payment) {
      throw new Error("No completed payment found for this booking");
    }

    if (!payment.gateway_transaction_id) {
      throw new Error("No payment intent ID found");
    }

    logStep("Payment found", { 
      paymentId: payment.id, 
      transactionId: payment.gateway_transaction_id,
      originalAmount: payment.amount 
    });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Calculate refund amount
    const refundAmount = amount || payment.amount;
    const refundAmountCents = Math.round(refundAmount * (payment.currency === 'IDR' ? 1 : 100));

    logStep("Processing Stripe refund", { refundAmount, refundAmountCents });

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.gateway_transaction_id,
      amount: refundAmountCents,
      reason: 'requested_by_customer',
      metadata: {
        bookingId,
        processedBy: user.id,
        reason
      }
    });

    logStep("Stripe refund created", { refundId: refund.id, status: refund.status });

    // Update payment status
    await supabaseClient
      .from('booking_payments')
      .update({
        payment_status: refundAmount >= payment.amount ? 'refunded' : 'partially_refunded',
        updated_at: new Date().toISOString(),
        gateway_response: {
          ...payment.gateway_response,
          refund: {
            refundId: refund.id,
            refundAmount,
            refundStatus: refund.status,
            processedAt: new Date().toISOString(),
            processedBy: user.id,
            reason
          }
        }
      })
      .eq('id', payment.id);

    // Update booking status
    const bookingTable = bookingType === 'rental' ? 'rental_bookings' : 'vendor_bookings';
    await supabaseClient
      .from(bookingTable)
      .update({
        payment_status: refundAmount >= payment.amount ? 'refunded' : 'partially_refunded',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    // Log refund transaction
    await supabaseClient
      .from('payment_logs')
      .insert({
        booking_id: bookingId,
        payment_method: 'stripe_refund',
        amount: -refundAmount, // Negative for refund
        currency: payment.currency,
        status: 'completed',
        response_data: {
          refundId: refund.id,
          originalPaymentIntent: payment.gateway_transaction_id,
          reason,
          processedBy: user.id
        }
      });

    logStep("Refund completed successfully");

    return new Response(JSON.stringify({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmount,
        currency: payment.currency,
        status: refund.status
      },
      message: 'Refund processed successfully'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-refund", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});