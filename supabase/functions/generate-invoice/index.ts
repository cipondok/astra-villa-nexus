import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceData {
  bookingId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    idNumber: string;
  };
  property: {
    title: string;
    location: string;
    type: string;
  };
  booking: {
    checkIn: string;
    checkOut: string;
    totalDays: number;
    status: string;
    paymentStatus: string;
  };
  pricing: {
    basePrice: number;
    totalDays: number;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
  };
  paymentMethod: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("rental_bookings")
      .select(`
        *,
        properties:property_id (
          title,
          location,
          city,
          property_type,
          price
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      throw new Error(`Error fetching booking: ${bookingError.message}`);
    }

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Calculate dates
    const issueDate = new Date().toISOString();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      bookingId: booking.id,
      invoiceNumber,
      issueDate,
      dueDate,
      customer: {
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone,
        address: booking.customer_address,
        idNumber: booking.customer_id_number
      },
      property: {
        title: booking.properties.title,
        location: `${booking.properties.location}, ${booking.properties.city}`,
        type: booking.properties.property_type
      },
      booking: {
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        totalDays: booking.total_days,
        status: booking.booking_status,
        paymentStatus: booking.payment_status
      },
      pricing: {
        basePrice: booking.base_price,
        totalDays: booking.total_days,
        subtotal: booking.base_price * booking.total_days,
        tax: booking.base_price * booking.total_days * 0.1,
        serviceCharge: booking.base_price * booking.total_days * 0.05,
        total: booking.total_amount
      },
      paymentMethod: booking.payment_method
    };

    // Save invoice to database
    const { error: invoiceError } = await supabaseClient
      .from("invoices")
      .upsert({
        booking_id: bookingId,
        invoice_number: invoiceNumber,
        invoice_data: invoiceData,
        issue_date: issueDate,
        due_date: dueDate,
        status: "generated",
        total_amount: booking.total_amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (invoiceError) {
      console.error("Error saving invoice:", invoiceError);
      // Continue even if saving fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoiceData,
        message: "Invoice generated successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error generating invoice:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate invoice"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});