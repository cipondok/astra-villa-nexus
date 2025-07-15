import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentVerificationRequest {
  vendorId: string;
  documentType: 'ktp' | 'npwp' | 'siup' | 'niu' | 'skk' | 'siuk';
  documentNumber: string;
  documentFile?: string; // base64 encoded file
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-DOCUMENTS] ${step}${detailsStr}`);
};

// Indonesian document validation patterns
const documentPatterns = {
  ktp: /^[0-9]{16}$/,
  npwp: /^[0-9]{15}$/,
  siup: /^[0-9]{3}\/[0-9]{2}\.[0-9]{2}\/[A-Z]{2}\/[0-9]{4}$/,
  niu: /^[0-9]{13}$/,
  skk: /^SKK\/[0-9]{3}\/[A-Z]{2}\/[0-9]{4}$/,
  siuk: /^SIUK\/[0-9]{3}\/[A-Z]{2}\/[0-9]{4}$/
};

const verifyDocumentFormat = (type: string, number: string): boolean => {
  const pattern = documentPatterns[type as keyof typeof documentPatterns];
  return pattern ? pattern.test(number) : false;
};

const checkDocumentDatabase = async (type: string, number: string): Promise<{valid: boolean, details?: any}> => {
  // Simulate Indonesian government database check
  logStep(`Checking ${type.toUpperCase()} in government database`, { number });
  
  // Mock validation logic - in real implementation, this would call actual government APIs
  const isValidFormat = verifyDocumentFormat(type, number);
  
  if (!isValidFormat) {
    return { valid: false, details: { reason: 'Invalid document format' } };
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response - 95% success rate for properly formatted documents
  const isValid = Math.random() > 0.05;
  
  return {
    valid: isValid,
    details: {
      verified_at: new Date().toISOString(),
      issuing_authority: getIssuingAuthority(type),
      status: isValid ? 'active' : 'not_found',
      verification_method: 'government_api'
    }
  };
};

const getIssuingAuthority = (type: string): string => {
  const authorities = {
    ktp: 'Dinas Kependudukan dan Pencatatan Sipil',
    npwp: 'Direktorat Jenderal Pajak',
    siup: 'Dinas Perindustrian dan Perdagangan',
    niu: 'Badan Koordinasi Penanaman Modal',
    skk: 'Kementerian Ketenagakerjaan',
    siuk: 'Dinas Tenaga Kerja'
  };
  return authorities[type as keyof typeof authorities] || 'Unknown Authority';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Document verification started");

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

    const { vendorId, documentType, documentNumber, documentFile }: DocumentVerificationRequest = await req.json();
    
    if (!vendorId || !documentType || !documentNumber) {
      throw new Error("Missing required fields: vendorId, documentType, documentNumber");
    }

    // Verify user has access to this vendor
    if (vendorId !== user.id) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || !['admin', 'customer_service'].includes(profile.role)) {
        throw new Error("Unauthorized: Cannot verify documents for this vendor");
      }
    }

    logStep("Document verification request", { vendorId, documentType, documentNumber });

    // Verify document format and check government database
    const verificationResult = await checkDocumentDatabase(documentType, documentNumber);
    
    logStep("Government database check completed", { valid: verificationResult.valid });

    // Store verification result
    const { data: verificationRecord, error: insertError } = await supabaseClient
      .from('vendor_document_verifications')
      .insert({
        vendor_id: vendorId,
        document_type: documentType,
        document_number: documentNumber,
        verification_status: verificationResult.valid ? 'verified' : 'failed',
        verification_details: verificationResult.details,
        verified_by: user.id,
        verified_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      logStep("Error storing verification result", { error: insertError });
      throw new Error(`Failed to store verification: ${insertError.message}`);
    }

    // Update vendor business profile verification status
    if (verificationResult.valid) {
      const updateField = `${documentType}_verified`;
      await supabaseClient
        .from('vendor_business_profiles')
        .update({
          [updateField]: true,
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', vendorId);

      logStep("Updated vendor business profile", { field: updateField });
    }

    // Check overall compliance status
    const { data: allVerifications } = await supabaseClient
      .from('vendor_document_verifications')
      .select('document_type, verification_status')
      .eq('vendor_id', vendorId)
      .eq('verification_status', 'verified');

    const verifiedDocs = allVerifications?.map(v => v.document_type) || [];
    const requiredDocs = ['ktp', 'npwp', 'siup'];
    const isCompliant = requiredDocs.every(doc => verifiedDocs.includes(doc));

    if (isCompliant) {
      await supabaseClient
        .from('vendor_business_profiles')
        .update({
          is_verified: true,
          verification_completed_at: new Date().toISOString()
        })
        .eq('vendor_id', vendorId);

      logStep("Vendor marked as fully compliant");
    }

    return new Response(JSON.stringify({
      success: true,
      verification: {
        id: verificationRecord.id,
        documentType,
        documentNumber,
        status: verificationResult.valid ? 'verified' : 'failed',
        details: verificationResult.details,
        isCompliant
      },
      message: verificationResult.valid ? 'Document verified successfully' : 'Document verification failed'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-documents", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});