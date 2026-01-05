import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
const MIDTRANS_IS_PRODUCTION = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION 
  ? "https://api.midtrans.com" 
  : "https://api.sandbox.midtrans.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!MIDTRANS_SERVER_KEY) {
      throw new Error("Midtrans server key not configured. Please add MIDTRANS_SERVER_KEY secret.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...params } = await req.json();

    switch (action) {
      case "create_transaction":
        return await createTransaction(params, supabase);
      case "check_status":
        return await checkTransactionStatus(params, supabase);
      case "refund":
        return await processRefund(params, supabase);
      case "cancel":
        return await cancelTransaction(params, supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Midtrans payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function createTransaction(params: any, supabase: any) {
  const { 
    order_id, 
    gross_amount, 
    customer_details, 
    item_details,
    payment_type,
    booking_id 
  } = params;

  // Build transaction payload based on payment type
  const transactionPayload: any = {
    transaction_details: {
      order_id,
      gross_amount: Math.round(gross_amount),
    },
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
      name: "Booking Payment",
    }],
  };

  // Add payment type specific configuration
  if (payment_type) {
    switch (payment_type) {
      case "gopay":
        transactionPayload.payment_type = "gopay";
        transactionPayload.gopay = { enable_callback: true };
        break;
      case "shopeepay":
        transactionPayload.payment_type = "shopeepay";
        break;
      case "dana":
        transactionPayload.payment_type = "dana";
        break;
      case "ovo":
        transactionPayload.payment_type = "ovo";
        transactionPayload.ovo = { phone: customer_details?.phone };
        break;
      case "bank_transfer_bca":
        transactionPayload.payment_type = "bank_transfer";
        transactionPayload.bank_transfer = { bank: "bca" };
        break;
      case "bank_transfer_bni":
        transactionPayload.payment_type = "bank_transfer";
        transactionPayload.bank_transfer = { bank: "bni" };
        break;
      case "bank_transfer_bri":
        transactionPayload.payment_type = "bank_transfer";
        transactionPayload.bank_transfer = { bank: "bri" };
        break;
      case "bank_transfer_mandiri":
        transactionPayload.payment_type = "echannel";
        transactionPayload.echannel = {
          bill_info1: "Payment for",
          bill_info2: order_id,
        };
        break;
      case "qris":
        transactionPayload.payment_type = "qris";
        break;
      case "cstore_indomaret":
        transactionPayload.payment_type = "cstore";
        transactionPayload.cstore = { store: "indomaret" };
        break;
      case "cstore_alfamart":
        transactionPayload.payment_type = "cstore";
        transactionPayload.cstore = { store: "alfamart" };
        break;
      default:
        // Use Snap for generic payment selection
        break;
    }
  }

  const authString = btoa(`${MIDTRANS_SERVER_KEY}:`);
  
  // Use Snap API for token generation (allows customer to choose payment method)
  const snapUrl = MIDTRANS_IS_PRODUCTION 
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const response = await fetch(snapUrl, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${authString}`,
    },
    body: JSON.stringify(transactionPayload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error_messages?.join(", ") || "Failed to create transaction");
  }

  // Store transaction record
  await supabase.from("payment_transactions").insert({
    order_id,
    booking_id,
    amount: gross_amount,
    currency: "IDR",
    payment_gateway: "midtrans",
    payment_method: payment_type || "snap",
    status: "pending",
    gateway_response: result,
    customer_email: customer_details?.email,
    customer_name: `${customer_details?.first_name || ""} ${customer_details?.last_name || ""}`.trim(),
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      token: result.token,
      redirect_url: result.redirect_url,
      order_id 
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function checkTransactionStatus(params: any, supabase: any) {
  const { order_id } = params;
  const authString = btoa(`${MIDTRANS_SERVER_KEY}:`);

  const response = await fetch(`${MIDTRANS_BASE_URL}/v2/${order_id}/status`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Basic ${authString}`,
    },
  });

  const result = await response.json();

  // Update local record
  const status = mapMidtransStatus(result.transaction_status, result.fraud_status);
  await supabase
    .from("payment_transactions")
    .update({ 
      status, 
      gateway_response: result,
      updated_at: new Date().toISOString() 
    })
    .eq("order_id", order_id);

  return new Response(
    JSON.stringify({ success: true, ...result, mapped_status: status }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function processRefund(params: any, supabase: any) {
  const { order_id, amount, reason } = params;
  const authString = btoa(`${MIDTRANS_SERVER_KEY}:`);

  const refundPayload: any = { reason: reason || "Customer request" };
  if (amount) {
    refundPayload.refund_key = `refund-${order_id}-${Date.now()}`;
    refundPayload.amount = Math.round(amount);
  }

  const response = await fetch(`${MIDTRANS_BASE_URL}/v2/${order_id}/refund`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${authString}`,
    },
    body: JSON.stringify(refundPayload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.status_message || "Refund failed");
  }

  // Record refund
  await supabase.from("payment_refunds").insert({
    order_id,
    refund_amount: amount || 0,
    reason,
    status: result.transaction_status === "refund" ? "completed" : "pending",
    gateway_response: result,
  });

  // Update transaction status
  await supabase
    .from("payment_transactions")
    .update({ status: "refunded", updated_at: new Date().toISOString() })
    .eq("order_id", order_id);

  return new Response(
    JSON.stringify({ success: true, ...result }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function cancelTransaction(params: any, supabase: any) {
  const { order_id } = params;
  const authString = btoa(`${MIDTRANS_SERVER_KEY}:`);

  const response = await fetch(`${MIDTRANS_BASE_URL}/v2/${order_id}/cancel`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Basic ${authString}`,
    },
  });

  const result = await response.json();

  await supabase
    .from("payment_transactions")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("order_id", order_id);

  return new Response(
    JSON.stringify({ success: true, ...result }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function mapMidtransStatus(transactionStatus: string, fraudStatus?: string): string {
  if (fraudStatus === "deny") return "failed";
  
  switch (transactionStatus) {
    case "capture":
    case "settlement":
      return "completed";
    case "pending":
      return "pending";
    case "deny":
    case "cancel":
    case "expire":
      return "failed";
    case "refund":
    case "partial_refund":
      return "refunded";
    default:
      return "pending";
  }
}
