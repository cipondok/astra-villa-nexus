import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { application_id, bank_id } = body;

    if (!application_id) {
      return new Response(JSON.stringify({ error: "application_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the application
    const { data: application, error: appError } = await supabase
      .from("mortgage_applications")
      .select("*")
      .eq("id", application_id)
      .eq("user_id", user.id)
      .single();

    if (appError || !application) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch partner bank details if bank_id provided
    let bankInfo = null;
    if (bank_id) {
      const { data: bank } = await supabase
        .from("acquisition_bank_partnerships")
        .select("*")
        .eq("id", bank_id)
        .eq("is_active", true)
        .single();
      bankInfo = bank;
    }

    // Generate reference number
    const refNumber = `KPR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Build status history
    const existingHistory = Array.isArray(application.status_history)
      ? application.status_history
      : [];

    const newHistory = [
      ...existingHistory,
      {
        status: "under_review",
        timestamp: new Date().toISOString(),
        note: bankInfo
          ? `Submitted to ${bankInfo.bank_name} for review`
          : "Application submitted for review",
      },
    ];

    // Update the application
    const { data: updated, error: updateError } = await supabase
      .from("mortgage_applications")
      .update({
        bank_id: bank_id || application.bank_id,
        status: "under_review",
        status_history: newHistory,
        bank_reference_number: refNumber,
        submitted_at: application.submitted_at || new Date().toISOString(),
      })
      .eq("id", application_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // If bank partnership, create a lead record
    if (bankInfo && bank_id) {
      await supabase.from("acquisition_bank_leads").insert({
        partnership_id: bank_id,
        user_id: user.id,
        property_id: application.property_id || null,
        lead_name: application.full_name,
        lead_email: application.email,
        lead_phone: application.phone,
        loan_amount_requested: application.loan_amount,
        property_value: application.property_price,
        down_payment_amount: application.down_payment,
        employment_type: application.employment_type,
        monthly_income: application.monthly_income,
        lead_status: "new",
        sent_to_bank_at: new Date().toISOString(),
        bank_reference_id: refNumber,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        application: updated,
        reference_number: refNumber,
        bank_name: bankInfo?.bank_name || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
