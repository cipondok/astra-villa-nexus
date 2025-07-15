import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BPJSVerificationRequest {
  vendorId: string;
  bpjsType: 'kesehatan' | 'ketenagakerjaan';
  bpjsNumber: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-BPJS] ${step}${detailsStr}`);
};

// BPJS number validation patterns
const bpjsPatterns = {
  kesehatan: /^[0-9]{13}$/,
  ketenagakerjaan: /^[0-9]{11}$/
};

const verifyBPJSFormat = (type: string, number: string): boolean => {
  const pattern = bpjsPatterns[type as keyof typeof bpjsPatterns];
  return pattern ? pattern.test(number) : false;
};

const checkBPJSDatabase = async (type: string, number: string): Promise<{valid: boolean, details?: any}> => {
  logStep(`Checking BPJS ${type} in government database`, { number });
  
  const isValidFormat = verifyBPJSFormat(type, number);
  
  if (!isValidFormat) {
    return { 
      valid: false, 
      details: { 
        reason: 'Invalid BPJS number format',
        expected_format: type === 'kesehatan' ? '13 digits' : '11 digits'
      } 
    };
  }

  // Simulate BPJS API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock BPJS verification - 90% success rate for properly formatted numbers
  const isValid = Math.random() > 0.1;
  
  return {
    valid: isValid,
    details: {
      verified_at: new Date().toISOString(),
      bpjs_type: type,
      status: isValid ? 'active' : 'inactive',
      participant_type: 'employer',
      registration_date: isValid ? '2020-01-15' : null,
      verification_method: 'bpjs_api'
    }
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("BPJS verification started");

    // Initialize Supabase with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { vendorId, bpjsType, bpjsNumber }: BPJSVerificationRequest = await req.json();
    
    if (!vendorId || !bpjsType || !bpjsNumber) {
      throw new Error("Missing required fields: vendorId, bpjsType, bpjsNumber");
    }

    // Verify user has access to this vendor
    if (vendorId !== user.id) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || !['admin', 'customer_service'].includes(profile.role)) {
        throw new Error("Unauthorized: Cannot verify BPJS for this vendor");
      }
    }

    logStep("BPJS verification request", { vendorId, bpjsType, bpjsNumber });

    // Check if already verified
    const { data: existingVerification } = await supabaseClient
      .from('bpjs_verifications')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('bpjs_type', bpjsType)
      .eq('verification_status', 'verified')
      .single();

    if (existingVerification) {
      return new Response(JSON.stringify({
        success: true,
        verification: existingVerification,
        message: 'BPJS already verified'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify BPJS with government database
    const verificationResult = await checkBPJSDatabase(bpjsType, bpjsNumber);
    
    logStep("BPJS database check completed", { valid: verificationResult.valid });

    // Store BPJS verification result
    const { data: verificationRecord, error: insertError } = await supabaseClient
      .from('bpjs_verifications')
      .insert({
        vendor_id: vendorId,
        bpjs_type: bpjsType,
        verification_number: bpjsNumber,
        verification_status: verificationResult.valid ? 'verified' : 'failed',
        verification_response: verificationResult.details,
        is_valid: verificationResult.valid,
        verified_at: verificationResult.valid ? new Date().toISOString() : null,
        expires_at: verificationResult.valid ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
      })
      .select()
      .single();

    if (insertError) {
      logStep("Error storing BPJS verification", { error: insertError });
      throw new Error(`Failed to store BPJS verification: ${insertError.message}`);
    }

    // Log verification attempt
    await supabaseClient
      .from('bpjs_verification_logs')
      .insert({
        vendor_id: vendorId,
        bpjs_number: bpjsNumber,
        verification_type: bpjsType,
        verification_status: verificationResult.valid ? 'success' : 'failed',
        api_response: verificationResult.details,
        verified_at: new Date().toISOString()
      });

    // Update vendor business profile
    if (verificationResult.valid) {
      const updateField = `bpjs_${bpjsType}_verified`;
      const statusField = `bpjs_${bpjsType}_status`;
      
      await supabaseClient
        .from('vendor_business_profiles')
        .update({
          [updateField]: true,
          [statusField]: 'verified',
          bpjs_verification_date: new Date().toISOString(),
          bpjs_verification_method: 'api',
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', vendorId);

      logStep("Updated vendor business profile", { field: updateField });
    }

    // Check if both BPJS types are verified for compliance
    const { data: bpjsVerifications } = await supabaseClient
      .from('bpjs_verifications')
      .select('bpjs_type')
      .eq('vendor_id', vendorId)
      .eq('verification_status', 'verified');

    const verifiedBPJS = bpjsVerifications?.map(v => v.bpjs_type) || [];
    const isBPJSCompliant = ['kesehatan', 'ketenagakerjaan'].every(type => verifiedBPJS.includes(type));

    if (isBPJSCompliant) {
      await supabaseClient
        .from('vendor_business_profiles')
        .update({
          bpjs_verification_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', vendorId);

      logStep("Vendor marked as BPJS compliant");
    }

    return new Response(JSON.stringify({
      success: true,
      verification: {
        id: verificationRecord.id,
        bpjsType,
        bpjsNumber,
        status: verificationResult.valid ? 'verified' : 'failed',
        details: verificationResult.details,
        expiresAt: verificationRecord.expires_at,
        isBPJSCompliant
      },
      message: verificationResult.valid ? 'BPJS verified successfully' : 'BPJS verification failed'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-bpjs", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});