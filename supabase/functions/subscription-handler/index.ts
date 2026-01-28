import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  action: 'subscribe' | 'cancel' | 'renew' | 'check_limits' | 'process_payment_success';
  userId?: string;
  planSlug?: string;
  invoiceId?: string;
  orderId?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-HANDLER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Subscription handler invoked");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const request: SubscriptionRequest = await req.json();
    logStep("Processing request", { action: request.action });

    // Get authenticated user if available
    let currentUserId = request.userId;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      currentUserId = userData?.user?.id || currentUserId;
    }

    let response: any = {};

    switch (request.action) {
      case 'subscribe': {
        if (!currentUserId || !request.planSlug) {
          throw new Error("User ID and plan slug required");
        }

        // Get plan
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', request.planSlug)
          .eq('is_active', true)
          .single();

        if (planError || !plan) {
          throw new Error("Plan not found");
        }

        const periodStart = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Create or update subscription
        const { data: subscription, error: subError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: currentUserId,
            plan_id: plan.id,
            status: plan.price_monthly === 0 ? 'active' : 'pending',
            billing_cycle: 'monthly',
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (subError) throw subError;

        // For free plans, no payment needed
        if (plan.price_monthly === 0) {
          response = { 
            success: true, 
            subscription, 
            message: 'Subscribed to free plan'
          };
          break;
        }

        // For paid plans, create invoice
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const taxRate = 0.11;
        const taxAmount = plan.price_monthly * taxRate;
        const totalAmount = plan.price_monthly + taxAmount;

        const { data: invoice, error: invoiceError } = await supabase
          .from('subscription_invoices')
          .insert({
            invoice_number: invoiceNumber,
            subscription_id: subscription.id,
            user_id: currentUserId,
            amount: plan.price_monthly,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            currency: 'IDR',
            status: 'pending',
            billing_period_start: periodStart.toISOString(),
            billing_period_end: periodEnd.toISOString(),
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            line_items: [{
              description: `${plan.name} Plan - Monthly Subscription`,
              amount: plan.price_monthly,
              quantity: 1
            }]
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        response = {
          success: true,
          subscription,
          invoice,
          requiresPayment: true,
          amount: totalAmount
        };
        break;
      }

      case 'process_payment_success': {
        if (!request.orderId) throw new Error("Order ID required");

        logStep("Processing payment success", { orderId: request.orderId });

        // Find invoice by order ID
        const { data: invoice, error: invoiceError } = await supabase
          .from('subscription_invoices')
          .select('*, subscription:user_subscriptions(*)')
          .eq('payment_order_id', request.orderId)
          .maybeSingle();

        // If no invoice with order ID, try to find by invoice number in order ID
        let invoiceToUpdate = invoice;
        if (!invoiceToUpdate && request.orderId.startsWith('SUB-')) {
          const invoiceNum = request.orderId.replace('SUB-', '');
          const { data: foundInvoice } = await supabase
            .from('subscription_invoices')
            .select('*, subscription:user_subscriptions(*)')
            .eq('invoice_number', invoiceNum)
            .maybeSingle();
          invoiceToUpdate = foundInvoice;
        }

        if (invoiceToUpdate) {
          // Update invoice
          await supabase
            .from('subscription_invoices')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              payment_order_id: request.orderId
            })
            .eq('id', invoiceToUpdate.id);

          // Activate subscription
          if (invoiceToUpdate.subscription_id) {
            await supabase
              .from('user_subscriptions')
              .update({
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('id', invoiceToUpdate.subscription_id);
          }

          response = { success: true, message: 'Subscription activated' };
        } else {
          response = { success: false, message: 'Invoice not found' };
        }
        break;
      }

      case 'cancel': {
        if (!currentUserId) throw new Error("User ID required");

        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUserId);

        if (error) throw error;

        response = { success: true, message: 'Subscription will be cancelled at period end' };
        break;
      }

      case 'check_limits': {
        if (!currentUserId) throw new Error("User ID required");

        // Get user's subscription
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', currentUserId)
          .eq('status', 'active')
          .maybeSingle();

        const plan = subscription?.plan;
        const listingLimit = plan?.listing_limit || 3; // Free plan default

        // Count this month's listings
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', currentUserId)
          .gte('created_at', startOfMonth.toISOString());

        const currentCount = count || 0;
        const remaining = listingLimit === null ? null : Math.max(0, listingLimit - currentCount);
        const canCreate = listingLimit === null || currentCount < listingLimit;

        response = {
          success: true,
          plan: plan?.slug || 'free',
          listingLimit: listingLimit === null ? 'unlimited' : listingLimit,
          currentCount,
          remaining,
          canCreate
        };
        break;
      }

      case 'renew': {
        // Handle subscription renewal (called by cron)
        const now = new Date();
        
        // Find subscriptions that need renewal
        const { data: expiringSubscriptions } = await supabase
          .from('user_subscriptions')
          .select('*, plan:subscription_plans(*), user:profiles(email)')
          .eq('status', 'active')
          .eq('cancel_at_period_end', false)
          .lte('current_period_end', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());

        let renewed = 0;
        let cancelled = 0;

        for (const sub of expiringSubscriptions || []) {
          if (sub.cancel_at_period_end) {
            // Cancel subscription
            await supabase
              .from('user_subscriptions')
              .update({
                status: 'cancelled',
                cancelled_at: now.toISOString()
              })
              .eq('id', sub.id);
            cancelled++;
          } else {
            // Extend period for free plans
            if (sub.plan?.price_monthly === 0) {
              const newPeriodEnd = new Date(sub.current_period_end);
              newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
              
              await supabase
                .from('user_subscriptions')
                .update({
                  current_period_start: sub.current_period_end,
                  current_period_end: newPeriodEnd.toISOString(),
                  updated_at: now.toISOString()
                })
                .eq('id', sub.id);
              renewed++;
            }
            // Paid plans would need payment processing here
          }
        }

        response = { success: true, renewed, cancelled };
        break;
      }

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
