import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user) throw new Error("User not authenticated");

    const { 
      bookingId, 
      paymentMethod, 
      amount, 
      currency = 'IDR',
      bankCode,
      ewalletType,
      useAstraToken 
    } = await req.json();

    // Get booking details
    const { data: booking } = await supabaseClient
      .from('vendor_bookings')
      .select('*, vendor_services(*)')
      .eq('id', bookingId)
      .single();

    if (!booking) throw new Error("Booking not found");

    let paymentResponse;

    switch (paymentMethod) {
      case 'stripe':
        // Existing Stripe payment
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: { bookingId }
        });
        
        paymentResponse = {
          paymentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          status: 'requires_payment_method'
        };
        break;

      case 'bank_transfer':
        // Indonesian Bank Transfer
        paymentResponse = await processIndonesianBankTransfer({
          amount,
          currency,
          bankCode,
          bookingId,
          customerName: user.user_metadata?.full_name || user.email
        });
        break;

      case 'ewallet':
        // Indonesian E-Wallet (GoPay, OVO, Dana, etc.)
        paymentResponse = await processIndonesianEwallet({
          amount,
          currency,
          ewalletType,
          bookingId,
          customerPhone: booking.contact_phone
        });
        break;

      case 'astra_token':
        // ASTRA Token payment
        paymentResponse = await processAstraTokenPayment({
          amount,
          userId: user.id,
          bookingId,
          supabaseClient
        });
        break;

      default:
        throw new Error("Unsupported payment method");
    }

    // Create payment record
    await supabaseClient.from('booking_payments').insert({
      booking_id: bookingId,
      stripe_payment_intent_id: paymentResponse.paymentId,
      amount,
      currency,
      status: paymentResponse.status,
      payment_method: paymentMethod
    });

    // Update booking payment status
    await supabaseClient
      .from('vendor_bookings')
      .update({ 
        payment_status: paymentResponse.status === 'succeeded' ? 'paid' : 'pending',
        stripe_payment_intent_id: paymentResponse.paymentId
      })
      .eq('id', bookingId);

    return new Response(JSON.stringify(paymentResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function processIndonesianBankTransfer({ amount, currency, bankCode, bookingId, customerName }) {
  // Simulate Indonesian bank transfer processing
  // In production, integrate with Indonesian payment gateway like Midtrans, Xendit, or Doku
  
  const virtualAccountNumber = generateVirtualAccount(bankCode);
  
  return {
    paymentId: `bank_${Date.now()}`,
    status: 'pending',
    paymentInstructions: {
      method: 'bank_transfer',
      bankCode,
      virtualAccountNumber,
      amount,
      currency,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      instructions: `Transfer ${amount} ${currency} to Virtual Account: ${virtualAccountNumber} (${getBankName(bankCode)})`
    }
  };
}

async function processIndonesianEwallet({ amount, currency, ewalletType, bookingId, customerPhone }) {
  // Simulate Indonesian e-wallet processing
  // In production, integrate with e-wallet APIs
  
  return {
    paymentId: `ewallet_${Date.now()}`,
    status: 'pending',
    paymentInstructions: {
      method: 'ewallet',
      ewalletType,
      amount,
      currency,
      deeplink: `${ewalletType}://pay?amount=${amount}&merchant=YourApp&ref=${bookingId}`,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`,
      instructions: `Open ${ewalletType} app and scan QR code or use the payment link`
    }
  };
}

async function processAstraTokenPayment({ amount, userId, bookingId, supabaseClient }) {
  // Check user's ASTRA token balance
  const { data: balance } = await supabaseClient
    .from('vendor_astra_balances')
    .select('balance')
    .eq('vendor_id', userId)
    .single();

  if (!balance || balance.balance < amount) {
    throw new Error("Insufficient ASTRA token balance");
  }

  // Deduct ASTRA tokens
  await supabaseClient
    .from('vendor_astra_balances')
    .update({ 
      balance: balance.balance - amount,
      updated_at: new Date().toISOString()
    })
    .eq('vendor_id', userId);

  // Create transaction record
  await supabaseClient
    .from('astra_token_transactions')
    .insert({
      vendor_id: userId,
      transaction_type: 'service_payment',
      amount: -amount,
      description: `Payment for booking ${bookingId}`,
      reference_id: bookingId
    });

  return {
    paymentId: `astra_${Date.now()}`,
    status: 'succeeded',
    astraTokensUsed: amount,
    remainingBalance: balance.balance - amount
  };
}

function generateVirtualAccount(bankCode) {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${bankCode}${timestamp}${random}`;
}

function getBankName(bankCode) {
  const banks = {
    '014': 'BCA',
    '008': 'Mandiri',
    '009': 'BNI',
    '002': 'BRI',
    '013': 'Permata',
    '011': 'Danamon'
  };
  return banks[bankCode] || 'Bank';
}
