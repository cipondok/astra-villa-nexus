import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KYCRequest {
  action: 'submit' | 'check_status' | 'verify_liveness' | 'extract_document';
  verificationId?: string;
  verificationType?: 'basic' | 'standard' | 'enhanced';
  documentType?: 'ktp' | 'passport' | 'sim' | 'kitas';
  documentImageBase64?: string;
  selfieImageBase64?: string;
}

interface LivenessResult {
  passed: boolean;
  score: number;
  checks: {
    blink_detected: boolean;
    face_centered: boolean;
    lighting_ok: boolean;
    not_photo: boolean;
  };
}

interface DocumentExtractionResult {
  success: boolean;
  document_type: string;
  extracted_data: {
    nik?: string;
    name?: string;
    birth_date?: string;
    birth_place?: string;
    gender?: string;
    address?: string;
    rt_rw?: string;
    kelurahan?: string;
    kecamatan?: string;
    religion?: string;
    marital_status?: string;
    occupation?: string;
    nationality?: string;
    valid_until?: string;
    issue_date?: string;
  };
  confidence: number;
}

interface FaceMatchResult {
  passed: boolean;
  score: number;
  same_person: boolean;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ENHANCED-KYC] ${step}${detailsStr}`);
};

// Simulate VIDA-style liveness detection
async function performLivenessCheck(selfieBase64: string): Promise<LivenessResult> {
  logStep('Performing liveness check');
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate liveness detection (in production, call VIDA API)
  const score = 70 + Math.random() * 28; // 70-98 range
  const passed = score >= 75;
  
  return {
    passed,
    score: Math.round(score * 10) / 10,
    checks: {
      blink_detected: Math.random() > 0.1,
      face_centered: Math.random() > 0.05,
      lighting_ok: Math.random() > 0.1,
      not_photo: Math.random() > 0.05,
    },
  };
}

// Simulate OCR document extraction
async function extractDocumentData(documentBase64: string, documentType: string): Promise<DocumentExtractionResult> {
  logStep('Extracting document data', { documentType });
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate OCR extraction (in production, call VIDA API)
  const confidence = 85 + Math.random() * 14; // 85-99 range
  
  // Generate mock extracted data based on document type
  const extractedData: DocumentExtractionResult['extracted_data'] = {};
  
  if (documentType === 'ktp') {
    extractedData.nik = '32' + Math.floor(Math.random() * 10000000000000).toString().padStart(14, '0');
    extractedData.name = 'NAMA LENGKAP PENGGUNA';
    extractedData.birth_place = 'JAKARTA';
    extractedData.birth_date = '01-01-1990';
    extractedData.gender = Math.random() > 0.5 ? 'LAKI-LAKI' : 'PEREMPUAN';
    extractedData.address = 'JL. CONTOH ALAMAT NO. 123';
    extractedData.rt_rw = '001/002';
    extractedData.kelurahan = 'KELURAHAN CONTOH';
    extractedData.kecamatan = 'KECAMATAN CONTOH';
    extractedData.religion = 'ISLAM';
    extractedData.marital_status = 'BELUM KAWIN';
    extractedData.occupation = 'KARYAWAN SWASTA';
    extractedData.nationality = 'WNI';
    extractedData.valid_until = 'SEUMUR HIDUP';
  } else if (documentType === 'passport') {
    extractedData.name = 'NAMA LENGKAP';
    extractedData.nationality = 'INDONESIA';
    extractedData.birth_date = '01 JAN 1990';
    extractedData.birth_place = 'JAKARTA';
    extractedData.gender = 'M';
    extractedData.issue_date = '01 JAN 2020';
    extractedData.valid_until = '01 JAN 2030';
  } else if (documentType === 'sim') {
    extractedData.name = 'NAMA PEMEGANG SIM';
    extractedData.birth_date = '01-01-1990';
    extractedData.address = 'ALAMAT SESUAI SIM';
    extractedData.valid_until = '01-01-2030';
  }
  
  return {
    success: true,
    document_type: documentType,
    extracted_data: extractedData,
    confidence: Math.round(confidence * 10) / 10,
  };
}

// Simulate face matching between document and selfie
async function performFaceMatch(documentBase64: string, selfieBase64: string): Promise<FaceMatchResult> {
  logStep('Performing face match');
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1800));
  
  // Simulate face matching (in production, call VIDA API)
  const score = 75 + Math.random() * 24; // 75-99 range
  const passed = score >= 80;
  
  return {
    passed,
    score: Math.round(score * 10) / 10,
    same_person: passed,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("KYC verification request received");

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

    const request: KYCRequest = await req.json();
    logStep("Processing request", { action: request.action, userId: user.id });

    let response: any = {};

    switch (request.action) {
      case 'submit': {
        // Full KYC submission
        if (!request.documentType || !request.verificationType) {
          throw new Error("Document type and verification type are required");
        }

        logStep("Starting KYC submission", { 
          type: request.verificationType,
          documentType: request.documentType 
        });

        // Step 1: Extract document data
        let extractionResult: DocumentExtractionResult | null = null;
        if (request.documentImageBase64) {
          extractionResult = await extractDocumentData(
            request.documentImageBase64, 
            request.documentType
          );
        }

        // Step 2: Liveness check (for standard and enhanced)
        let livenessResult: LivenessResult | null = null;
        if (request.verificationType !== 'basic' && request.selfieImageBase64) {
          livenessResult = await performLivenessCheck(request.selfieImageBase64);
        }

        // Step 3: Face matching (for enhanced)
        let faceMatchResult: FaceMatchResult | null = null;
        if (request.verificationType === 'enhanced' && 
            request.documentImageBase64 && 
            request.selfieImageBase64) {
          faceMatchResult = await performFaceMatch(
            request.documentImageBase64,
            request.selfieImageBase64
          );
        }

        // Determine overall status
        let status = 'verified';
        let rejectionReason: string | null = null;

        if (request.verificationType === 'basic') {
          // Basic only requires document
          if (!extractionResult || extractionResult.confidence < 70) {
            status = 'manual_review';
            rejectionReason = 'Document quality too low for automatic verification';
          }
        } else if (request.verificationType === 'standard') {
          // Standard requires document + liveness
          if (!livenessResult?.passed) {
            status = 'rejected';
            rejectionReason = 'Liveness check failed - please ensure good lighting and follow instructions';
          } else if (!extractionResult || extractionResult.confidence < 75) {
            status = 'manual_review';
            rejectionReason = 'Document requires manual review';
          }
        } else if (request.verificationType === 'enhanced') {
          // Enhanced requires all checks
          if (!livenessResult?.passed) {
            status = 'rejected';
            rejectionReason = 'Liveness verification failed';
          } else if (!faceMatchResult?.passed) {
            status = 'rejected';
            rejectionReason = 'Face does not match document photo';
          } else if (!extractionResult || extractionResult.confidence < 80) {
            status = 'manual_review';
            rejectionReason = 'Document requires manual verification';
          }
        }

        // Save verification record
        const { data: verification, error: insertError } = await supabaseClient
          .from('kyc_verifications')
          .insert({
            user_id: user.id,
            verification_type: request.verificationType,
            document_type: request.documentType,
            document_number: extractionResult?.extracted_data?.nik || null,
            liveness_score: livenessResult?.score || null,
            liveness_passed: livenessResult?.passed || false,
            face_match_score: faceMatchResult?.score || null,
            face_match_passed: faceMatchResult?.passed || false,
            extracted_data: extractionResult?.extracted_data || {},
            status,
            rejection_reason: rejectionReason,
            provider: 'vida_simulation',
            provider_response: {
              extraction: extractionResult,
              liveness: livenessResult,
              face_match: faceMatchResult,
            },
          })
          .select()
          .single();

        if (insertError) {
          logStep("Error saving verification", { error: insertError.message });
          throw new Error(`Failed to save verification: ${insertError.message}`);
        }

        response = {
          success: true,
          verification_id: verification.id,
          status,
          rejection_reason: rejectionReason,
          details: {
            extraction: extractionResult ? {
              success: extractionResult.success,
              confidence: extractionResult.confidence,
              extracted_fields: Object.keys(extractionResult.extracted_data),
            } : null,
            liveness: livenessResult ? {
              passed: livenessResult.passed,
              score: livenessResult.score,
            } : null,
            face_match: faceMatchResult ? {
              passed: faceMatchResult.passed,
              score: faceMatchResult.score,
            } : null,
          },
        };

        logStep("KYC submission completed", { status, verificationId: verification.id });
        break;
      }

      case 'check_status': {
        const { data: verifications, error } = await supabaseClient
          .from('kyc_verifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        response = {
          success: true,
          verification: verifications?.[0] || null,
          kyc_level: verifications?.[0]?.status === 'verified' 
            ? verifications[0].verification_type 
            : 'none',
        };
        break;
      }

      case 'verify_liveness': {
        if (!request.selfieImageBase64) {
          throw new Error("Selfie image is required for liveness check");
        }

        const livenessResult = await performLivenessCheck(request.selfieImageBase64);
        
        response = {
          success: true,
          liveness: livenessResult,
        };
        break;
      }

      case 'extract_document': {
        if (!request.documentImageBase64 || !request.documentType) {
          throw new Error("Document image and type are required");
        }

        const extractionResult = await extractDocumentData(
          request.documentImageBase64,
          request.documentType
        );
        
        response = {
          success: true,
          extraction: extractionResult,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in enhanced-kyc", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Soft failure pattern
    });
  }
});
