import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const notification = await req.json();
    console.log("Midtrans webhook received:", JSON.stringify(notification));

    // Verify signature
    const { order_id, status_code, gross_amount, signature_key } = notification;
    const expectedSignature = await generateSignature(order_id, status_code, gross_amount);
    
    if (signature_key !== expectedSignature) {
      console.error("Invalid signature");
      throw new Error("Invalid signature");
    }

    // Map status
    const status = mapMidtransStatus(notification.transaction_status, notification.fraud_status);
    
    // Update transaction record
    const { data: transaction, error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status,
        gateway_response: notification,
        payment_method: notification.payment_type,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
    }

    // Update related booking if exists
    if (transaction?.booking_id) {
      const bookingStatus = status === "completed" ? "confirmed" : 
                           status === "failed" ? "cancelled" : "pending";
      
      await supabase
        .from("vendor_bookings")
        .update({ 
          status: bookingStatus,
          payment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq("id", transaction.booking_id);

      // Create notification for vendor/customer
      if (status === "completed") {
        await supabase.from("notifications").insert([
          {
            user_id: transaction.customer_id,
            title: "Payment Successful",
            message: `Your payment of Rp ${Number(gross_amount).toLocaleString("id-ID")} has been confirmed.`,
            type: "payment",
            reference_id: order_id,
          }
        ]);
      }
    }

    // Log webhook
    await supabase.from("payment_webhook_logs").insert({
      order_id,
      event_type: notification.transaction_status,
      payload: notification,
      processed: true,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateSignature(orderId: string, statusCode: string, grossAmount: string): Promise<string> {
  const data = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-512", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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
