import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "sandbox"; // sandbox or live

const PAYPAL_API_URL = PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("PayPal auth error:", error);
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      action, 
      order_id, 
      amount, 
      currency = "USD",
      booking_id,
      description,
      return_url,
      cancel_url,
      paypal_order_id,
      capture_id,
      reason
    } = await req.json();

    console.log(`PayPal action: ${action}`, { order_id, amount, currency });

    // Check if PayPal is configured
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "PayPal not configured. Please configure PayPal credentials in the admin panel." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getPayPalAccessToken();

    switch (action) {
      case "create_order": {
        // Create PayPal order
        const orderPayload = {
          intent: "CAPTURE",
          purchase_units: [{
            reference_id: order_id,
            description: description || "Payment",
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          }],
          application_context: {
            return_url,
            cancel_url,
            brand_name: "Astra Villa Realty",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
          },
        };

        const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderPayload),
        });

        if (!orderResponse.ok) {
          const error = await orderResponse.text();
          console.error("PayPal create order error:", error);
          throw new Error("Failed to create PayPal order");
        }

        const paypalOrder = await orderResponse.json();
        const approvalUrl = paypalOrder.links?.find((l: any) => l.rel === "approve")?.href;

        // Store transaction record
        await supabase.from("payment_transactions").insert({
          order_id,
          gateway: "paypal",
          gateway_transaction_id: paypalOrder.id,
          amount,
          currency,
          status: "pending",
          booking_id,
          gateway_response: paypalOrder,
        });

        return new Response(
          JSON.stringify({
            success: true,
            id: paypalOrder.id,
            status: paypalOrder.status,
            approval_url: approvalUrl,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "capture_order": {
        // Capture the approved order
        const captureResponse = await fetch(
          `${PAYPAL_API_URL}/v2/checkout/orders/${paypal_order_id}/capture`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!captureResponse.ok) {
          const error = await captureResponse.text();
          console.error("PayPal capture error:", error);
          throw new Error("Failed to capture PayPal payment");
        }

        const captureData = await captureResponse.json();
        const captureStatus = captureData.status === "COMPLETED" ? "completed" : "failed";

        // Update transaction record
        await supabase
          .from("payment_transactions")
          .update({
            status: captureStatus,
            gateway_response: captureData,
            updated_at: new Date().toISOString(),
          })
          .eq("gateway_transaction_id", paypal_order_id);

        // Update booking if exists
        const { data: transaction } = await supabase
          .from("payment_transactions")
          .select("booking_id")
          .eq("gateway_transaction_id", paypal_order_id)
          .single();

        if (transaction?.booking_id && captureStatus === "completed") {
          await supabase
            .from("vendor_bookings")
            .update({
              status: "confirmed",
              payment_status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", transaction.booking_id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: captureData.status,
            capture_id: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
            data: captureData,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_status": {
        const statusResponse = await fetch(
          `${PAYPAL_API_URL}/v2/checkout/orders/${paypal_order_id}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );

        if (!statusResponse.ok) {
          throw new Error("Failed to check PayPal order status");
        }

        const statusData = await statusResponse.json();

        return new Response(
          JSON.stringify({
            success: true,
            status: statusData.status,
            data: statusData,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "refund": {
        const refundPayload: any = {};
        if (amount) {
          refundPayload.amount = {
            value: amount.toFixed(2),
            currency_code: currency,
          };
        }
        if (reason) {
          refundPayload.note_to_payer = reason;
        }

        const refundResponse = await fetch(
          `${PAYPAL_API_URL}/v2/payments/captures/${capture_id}/refund`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(refundPayload),
          }
        );

        if (!refundResponse.ok) {
          const error = await refundResponse.text();
          console.error("PayPal refund error:", error);
          throw new Error("Failed to process refund");
        }

        const refundData = await refundResponse.json();

        return new Response(
          JSON.stringify({
            success: true,
            refund_id: refundData.id,
            status: refundData.status,
            data: refundData,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error("PayPal payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
