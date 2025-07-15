import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  bookingId: string;
  amount: number;
  paymentMethod: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, amount, paymentMethod, customerInfo }: PaymentRequest = await req.json();

    if (!bookingId || !amount || !paymentMethod) {
      throw new Error("Missing required parameters");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let paymentInstructions = {};
    let paymentStatus = "pending";

    // Generate payment instructions based on payment method
    switch (paymentMethod) {
      case 'ovo':
        paymentInstructions = {
          type: 'e_wallet',
          provider: 'OVO',
          qrCode: `ovo://payment?amount=${amount}&merchant=PropertyRental&ref=${bookingId}`,
          deeplink: `ovo://payment?amount=${amount}&merchant=PropertyRental&ref=${bookingId}`,
          instructions: [
            'Buka aplikasi OVO di smartphone Anda',
            'Scan QR code atau klik link pembayaran',
            'Masukkan PIN OVO untuk konfirmasi',
            'Pembayaran akan diproses secara otomatis'
          ],
          expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };
        break;

      case 'gopay':
        paymentInstructions = {
          type: 'e_wallet',
          provider: 'GoPay',
          qrCode: `gojek://gopay/pay?amount=${amount}&merchant=PropertyRental&ref=${bookingId}`,
          deeplink: `gojek://gopay/pay?amount=${amount}&merchant=PropertyRental&ref=${bookingId}`,
          instructions: [
            'Buka aplikasi Gojek di smartphone Anda',
            'Pilih GoPay dan scan QR code',
            'Masukkan PIN GoPay untuk konfirmasi',
            'Pembayaran akan diproses secara otomatis'
          ],
          expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
        break;

      case 'dana':
        paymentInstructions = {
          type: 'e_wallet',
          provider: 'DANA',
          qrCode: `dana://pay?amount=${amount}&merchant=PropertyRental&ref=${bookingId}`,
          deeplink: `dana://pay?amount=${amount}&merchant=PropertyRental&ref=${bookingId}`,
          instructions: [
            'Buka aplikasi DANA di smartphone Anda',
            'Scan QR code atau klik link pembayaran',
            'Masukkan PIN DANA untuk konfirmasi',
            'Pembayaran akan diproses secara otomatis'
          ],
          expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
        break;

      case 'shopeepay':
        paymentInstructions = {
          type: 'e_wallet',
          provider: 'ShopeePay',
          qrCode: `shopeeid://payment?amount=${amount}&merchant=PropertyRental&ref=${bookingId}`,
          deeplink: `shopeeid://payment?amount=${amount}&merchant=PropertyRental&ref=${bookingId}`,
          instructions: [
            'Buka aplikasi Shopee di smartphone Anda',
            'Pilih ShopeePay dan scan QR code',
            'Masukkan PIN ShopeePay untuk konfirmasi',
            'Pembayaran akan diproses secara otomatis'
          ],
          expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
        break;

      case 'bca':
        paymentInstructions = {
          type: 'bank_transfer',
          provider: 'Bank BCA',
          virtualAccount: `7017${bookingId.slice(-6)}`,
          instructions: [
            'Login ke BCA Mobile atau KlikBCA',
            'Pilih menu Transfer > BCA Virtual Account',
            'Masukkan nomor Virtual Account yang tertera',
            'Masukkan nominal pembayaran yang sesuai',
            'Ikuti instruksi untuk menyelesaikan transfer'
          ],
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        break;

      case 'mandiri':
        paymentInstructions = {
          type: 'bank_transfer',
          provider: 'Bank Mandiri',
          virtualAccount: `89608${bookingId.slice(-6)}`,
          instructions: [
            'Login ke Mandiri Online atau Livin by Mandiri',
            'Pilih menu Transfer > Virtual Account',
            'Masukkan nomor Virtual Account yang tertera',
            'Masukkan nominal pembayaran yang sesuai',
            'Ikuti instruksi untuk menyelesaikan transfer'
          ],
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        break;

      case 'bni':
        paymentInstructions = {
          type: 'bank_transfer',
          provider: 'Bank BNI',
          virtualAccount: `8808${bookingId.slice(-6)}`,
          instructions: [
            'Login ke BNI Mobile Banking atau BNI Internet Banking',
            'Pilih menu Transfer > Virtual Account Billing',
            'Masukkan nomor Virtual Account yang tertera',
            'Masukkan nominal pembayaran yang sesuai',
            'Ikuti instruksi untuk menyelesaikan transfer'
          ],
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        break;

      case 'bri':
        paymentInstructions = {
          type: 'bank_transfer',
          provider: 'Bank BRI',
          virtualAccount: `26215${bookingId.slice(-6)}`,
          instructions: [
            'Login ke BRImo atau BRI Internet Banking',
            'Pilih menu Transfer > BRIVA',
            'Masukkan nomor Virtual Account yang tertera',
            'Masukkan nominal pembayaran yang sesuai',
            'Ikuti instruksi untuk menyelesaikan transfer'
          ],
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        break;

      case 'credit_card':
        paymentInstructions = {
          type: 'credit_card',
          provider: 'Credit/Debit Card',
          instructions: [
            'Silakan hubungi customer service untuk proses pembayaran kartu kredit',
            'Atau transfer ke rekening bank yang tersedia',
            'Konfirmasi pembayaran akan dikirim via email'
          ]
        };
        break;

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    // Log payment attempt
    const { error: logError } = await supabaseClient
      .from("payment_logs")
      .insert({
        booking_id: bookingId,
        payment_method: paymentMethod,
        amount: amount,
        currency: 'IDR',
        status: paymentStatus,
        response_data: paymentInstructions,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error("Error logging payment attempt:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentMethod: paymentMethod,
        paymentInstructions: paymentInstructions,
        status: paymentStatus,
        expiryTime: paymentInstructions.expiryTime,
        message: "Payment instructions generated successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create payment"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});