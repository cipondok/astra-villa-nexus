import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
const MIDTRANS_IS_PRODUCTION = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";
const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

type Action =
  | 'create_checkout'
  | 'process_refund'
  | 'handle_subscription'
  | 'generate_invoice'
  | 'verify_payment'
  | 'wallet_operation';

interface PaymentRequest {
  action: Action;
  [key: string]: unknown;
}

const log = (step: string, details?: unknown) => {
  console.log(`[PAYMENT-ENGINE] ${step}`, details ? JSON.stringify(details) : '');
};

// ─── helpers ────────────────────────────────────────────────────────
function midtransAuth() {
  if (!MIDTRANS_SERVER_KEY) throw new Error("MIDTRANS_SERVER_KEY not configured");
  return `Basic ${btoa(`${MIDTRANS_SERVER_KEY}:`)}`;
}

function mapMidtransStatus(txStatus: string, fraudStatus?: string): string {
  if (fraudStatus === "deny") return "failed";
  switch (txStatus) {
    case "capture":
    case "settlement": return "completed";
    case "pending": return "pending";
    case "deny":
    case "cancel":
    case "expire": return "failed";
    case "refund":
    case "partial_refund": return "refunded";
    default: return "pending";
  }
}

function buildMidtransPayload(params: Record<string, any>) {
  const { order_id, gross_amount, customer_details, item_details, payment_type, booking_id } = params;

  const payload: Record<string, any> = {
    transaction_details: { order_id, gross_amount: Math.round(gross_amount) },
    customer_details: {
      first_name: customer_details?.first_name || "Customer",
      last_name: customer_details?.last_name || "",
      email: customer_details?.email || "",
      phone: customer_details?.phone || "",
    },
    item_details: item_details || [{
      id: booking_id || order_id,
      price: Math.round(gross_amount),
      quantity: 1,
      name: "Payment",
    }],
  };

  const typeMap: Record<string, () => void> = {
    gopay: () => { payload.payment_type = "gopay"; payload.gopay = { enable_callback: true }; },
    shopeepay: () => { payload.payment_type = "shopeepay"; },
    dana: () => { payload.payment_type = "dana"; },
    ovo: () => { payload.payment_type = "ovo"; payload.ovo = { phone: customer_details?.phone }; },
    qris: () => { payload.payment_type = "qris"; },
    bank_transfer_bca: () => { payload.payment_type = "bank_transfer"; payload.bank_transfer = { bank: "bca" }; },
    bank_transfer_bni: () => { payload.payment_type = "bank_transfer"; payload.bank_transfer = { bank: "bni" }; },
    bank_transfer_bri: () => { payload.payment_type = "bank_transfer"; payload.bank_transfer = { bank: "bri" }; },
    bank_transfer_mandiri: () => {
      payload.payment_type = "echannel";
      payload.echannel = { bill_info1: "Payment for", bill_info2: order_id };
    },
    cstore_indomaret: () => { payload.payment_type = "cstore"; payload.cstore = { store: "indomaret" }; },
    cstore_alfamart: () => { payload.payment_type = "cstore"; payload.cstore = { store: "alfamart" }; },
  };

  if (payment_type && typeMap[payment_type]) typeMap[payment_type]();
  return payload;
}

// ─── action handlers ────────────────────────────────────────────────

async function createCheckout(params: Record<string, any>, supabase: any, userId: string | null) {
  const payload = buildMidtransPayload(params);
  const res = await fetch(MIDTRANS_SNAP_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: midtransAuth() },
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error_messages?.join(", ") || "Failed to create checkout");

  await supabase.from("payment_transactions").insert({
    order_id: params.order_id,
    booking_id: params.booking_id,
    amount: params.gross_amount,
    currency: "IDR",
    payment_gateway: "midtrans",
    payment_method: params.payment_type || "snap",
    status: "pending",
    gateway_response: result,
    customer_email: params.customer_details?.email,
    customer_name: `${params.customer_details?.first_name || ""} ${params.customer_details?.last_name || ""}`.trim(),
    user_id: userId,
  });

  return { success: true, token: result.token, redirect_url: result.redirect_url, order_id: params.order_id };
}

async function processRefund(params: Record<string, any>, supabase: any) {
  const { order_id, amount, reason } = params;
  const body: Record<string, any> = { reason: reason || "Customer request" };
  if (amount) {
    body.refund_key = `refund-${order_id}-${Date.now()}`;
    body.amount = Math.round(amount);
  }

  const res = await fetch(`${MIDTRANS_BASE_URL}/v2/${order_id}/refund`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: midtransAuth() },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.status_message || "Refund failed");

  await supabase.from("payment_refunds").insert({
    order_id, refund_amount: amount || 0, reason,
    status: result.transaction_status === "refund" ? "completed" : "pending",
    gateway_response: result,
  });

  await supabase.from("payment_transactions")
    .update({ status: "refunded", updated_at: new Date().toISOString() })
    .eq("order_id", order_id);

  return { success: true, ...result };
}

async function handleSubscription(params: Record<string, any>, supabase: any, userId: string | null) {
  const { sub_action, plan_slug, order_id } = params;

  switch (sub_action) {
    case 'subscribe': {
      if (!userId || !plan_slug) throw new Error("User ID and plan_slug required");
      const { data: plan, error: pe } = await supabase.from('subscription_plans').select('*').eq('slug', plan_slug).eq('is_active', true).single();
      if (pe || !plan) throw new Error("Plan not found");

      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { data: subscription, error: se } = await supabase.from('user_subscriptions').upsert({
        user_id: userId, plan_id: plan.id,
        status: plan.price_monthly === 0 ? 'active' : 'pending',
        billing_cycle: 'monthly',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single();
      if (se) throw se;

      if (plan.price_monthly === 0) return { success: true, subscription, message: 'Free plan activated' };

      const taxRate = 0.11;
      const taxAmount = plan.price_monthly * taxRate;
      const totalAmount = plan.price_monthly + taxAmount;
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data: invoice, error: ie } = await supabase.from('subscription_invoices').insert({
        invoice_number: invoiceNumber, subscription_id: subscription.id, user_id: userId,
        amount: plan.price_monthly, tax_amount: taxAmount, total_amount: totalAmount,
        currency: 'IDR', status: 'pending',
        billing_period_start: periodStart.toISOString(),
        billing_period_end: periodEnd.toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        line_items: [{ description: `${plan.name} Plan - Monthly`, amount: plan.price_monthly, quantity: 1 }],
      }).select().single();
      if (ie) throw ie;

      return { success: true, subscription, invoice, requiresPayment: true, amount: totalAmount };
    }

    case 'cancel': {
      if (!userId) throw new Error("User ID required");
      const { error } = await supabase.from('user_subscriptions')
        .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (error) throw error;
      return { success: true, message: 'Cancellation scheduled at period end' };
    }

    case 'activate_payment': {
      if (!order_id) throw new Error("order_id required");
      let invoice = null;
      const { data: inv1 } = await supabase.from('subscription_invoices')
        .select('*, subscription:user_subscriptions(*)').eq('payment_order_id', order_id).maybeSingle();
      invoice = inv1;
      if (!invoice && order_id.startsWith('SUB-')) {
        const { data: inv2 } = await supabase.from('subscription_invoices')
          .select('*, subscription:user_subscriptions(*)').eq('invoice_number', order_id.replace('SUB-', '')).maybeSingle();
        invoice = inv2;
      }
      if (!invoice) return { success: false, message: 'Invoice not found' };

      await supabase.from('subscription_invoices').update({ status: 'paid', paid_at: new Date().toISOString(), payment_order_id: order_id }).eq('id', invoice.id);
      if (invoice.subscription_id) {
        await supabase.from('user_subscriptions').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', invoice.subscription_id);
      }
      return { success: true, message: 'Subscription activated' };
    }

    case 'check_limits': {
      if (!userId) throw new Error("User ID required");
      const { data: sub } = await supabase.from('user_subscriptions').select('*, plan:subscription_plans(*)').eq('user_id', userId).eq('status', 'active').maybeSingle();
      const listingLimit = sub?.plan?.listing_limit ?? 3;
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('owner_id', userId).gte('created_at', startOfMonth.toISOString());
      const currentCount = count || 0;
      const remaining = listingLimit === null ? null : Math.max(0, listingLimit - currentCount);
      return { success: true, plan: sub?.plan?.slug || 'free', listingLimit: listingLimit === null ? 'unlimited' : listingLimit, currentCount, remaining, canCreate: listingLimit === null || currentCount < listingLimit };
    }

    case 'renew': {
      const now = new Date();
      const { data: expiring } = await supabase.from('user_subscriptions').select('*, plan:subscription_plans(*)').eq('status', 'active').eq('cancel_at_period_end', false).lte('current_period_end', new Date(now.getTime() + 86400000).toISOString());
      let renewed = 0, cancelled = 0;
      for (const sub of expiring || []) {
        if (sub.cancel_at_period_end) {
          await supabase.from('user_subscriptions').update({ status: 'cancelled', cancelled_at: now.toISOString() }).eq('id', sub.id);
          cancelled++;
        } else if (sub.plan?.price_monthly === 0) {
          const newEnd = new Date(sub.current_period_end); newEnd.setMonth(newEnd.getMonth() + 1);
          await supabase.from('user_subscriptions').update({ current_period_start: sub.current_period_end, current_period_end: newEnd.toISOString(), updated_at: now.toISOString() }).eq('id', sub.id);
          renewed++;
        }
      }
      return { success: true, renewed, cancelled };
    }

    default:
      throw new Error(`Unknown sub_action: ${sub_action}`);
  }
}

async function generateInvoice(params: Record<string, any>, supabase: any, userId: string | null) {
  const { subscription_id, amount, description, tax_rate = 0.11 } = params;
  if (!userId) throw new Error("User ID required");

  const taxAmount = amount * tax_rate;
  const totalAmount = amount + taxAmount;
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const { data: invoice, error } = await supabase.from('subscription_invoices').insert({
    invoice_number: invoiceNumber,
    subscription_id: subscription_id || null,
    user_id: userId,
    amount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    currency: 'IDR',
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    line_items: [{ description: description || 'Service', amount, quantity: 1 }],
  }).select().single();
  if (error) throw error;

  return { success: true, invoice };
}

async function verifyPayment(params: Record<string, any>, supabase: any) {
  const { order_id } = params;
  if (!order_id) throw new Error("order_id required");

  const res = await fetch(`${MIDTRANS_BASE_URL}/v2/${order_id}/status`, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: midtransAuth() },
  });
  const result = await res.json();

  const status = mapMidtransStatus(result.transaction_status, result.fraud_status);
  await supabase.from("payment_transactions")
    .update({ status, gateway_response: result, updated_at: new Date().toISOString() })
    .eq("order_id", order_id);

  return { success: true, ...result, mapped_status: status };
}

async function walletOperation(params: Record<string, any>, supabase: any, userId: string | null) {
  const { wallet_action, amount, currency = 'IDR', reference, metadata } = params;
  if (!userId) throw new Error("User ID required");

  switch (wallet_action) {
    case 'balance': {
      const { data } = await supabase.from('transaction_logs')
        .select('amount, transaction_type')
        .eq('user_id', userId)
        .eq('status', 'completed');
      const balance = (data || []).reduce((acc: number, t: any) => {
        return acc + (t.transaction_type === 'credit' ? t.amount : -t.amount);
      }, 0);
      return { success: true, balance, currency };
    }

    case 'credit':
    case 'debit': {
      if (!amount || amount <= 0) throw new Error("Valid amount required");
      const { data, error } = await supabase.from('transaction_logs').insert({
        user_id: userId,
        amount,
        currency,
        transaction_type: wallet_action,
        status: 'completed',
        reference_id: reference,
        metadata: metadata || {},
      }).select().single();
      if (error) throw error;
      return { success: true, transaction: data };
    }

    case 'history': {
      const { data } = await supabase.from('transaction_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      return { success: true, transactions: data || [] };
    }

    default:
      throw new Error(`Unknown wallet_action: ${wallet_action}`);
  }
}

// ─── main handler ───────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Authenticate user (optional for some actions)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data, error } = await supabase.auth.getClaims(token);
      if (!error && data?.claims) {
        userId = data.claims.sub as string;
      }
    }

    const body: PaymentRequest = await req.json();
    const { action, ...params } = body;
    log("Invoked", { action, userId: userId?.slice(0, 8) });

    let result: Record<string, unknown>;

    switch (action) {
      case 'create_checkout':
        result = await createCheckout(params, supabase, userId);
        break;
      case 'process_refund':
        result = await processRefund(params, supabase);
        break;
      case 'handle_subscription':
        result = await handleSubscription(params, supabase, userId);
        break;
      case 'generate_invoice':
        result = await generateInvoice(params, supabase, userId);
        break;
      case 'verify_payment':
        result = await verifyPayment(params, supabase);
        break;
      case 'wallet_operation':
        result = await walletOperation(params, supabase, userId);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    log("Success", { action });
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
