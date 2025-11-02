import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VendorVerificationRequest {
  vendorId: string;
  verificationType: 'general' | 'ktp' | 'npwp' | 'siup' | 'niu' | 'skk' | 'siuk';
  status: boolean;
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('verify-vendor function called');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated and is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Authenticated user:', user.id);

    // Check if user has admin role
    const { data: isAdmin, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError);
      throw new Error('Admin access required');
    }

    console.log('Admin verified');

    // Parse request body
    const { vendorId, verificationType, status, notes }: VendorVerificationRequest = await req.json();

    if (!vendorId || !verificationType) {
      throw new Error('Missing required fields: vendorId, verificationType');
    }

    console.log('Vendor verification request:', { vendorId, verificationType, status });

    // Create service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Check if vendor profile exists
    const { data: existingVendor, error: vendorCheckError } = await supabaseAdmin
      .from('vendor_profiles')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (vendorCheckError || !existingVendor) {
      throw new Error('Vendor profile not found');
    }

    const timestamp = new Date().toISOString();
    const updateData: any = {};

    // Set the appropriate verification field
    switch (verificationType) {
      case 'general':
        updateData.is_verified = status;
        updateData.verification_completed_at = status ? timestamp : null;
        break;
      case 'ktp':
        updateData.ktp_verified = status;
        break;
      case 'npwp':
        updateData.npwp_verified = status;
        break;
      case 'siup':
        updateData.siup_verified = status;
        break;
      case 'niu':
        updateData.niu_verified = status;
        break;
      case 'skk':
        updateData.skk_verified = status;
        break;
      case 'siuk':
        updateData.siuk_verified = status;
        break;
    }

    // Update vendor profile
    const { data, error } = await supabaseAdmin
      .from('vendor_profiles')
      .update(updateData)
      .eq('vendor_id', vendorId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      throw error;
    }

    console.log('Updated vendor verification:', data);

    // Log verification action
    await supabaseAdmin
      .from('vendor_document_verifications')
      .insert({
        vendor_id: vendorId,
        document_type: verificationType,
        verification_status: status ? 'verified' : 'rejected',
        verified_by: user.id,
        verified_at: timestamp,
        verification_notes: notes || null
      })
      .catch(err => console.error('Failed to log verification:', err));

    // Log admin action
    await supabaseAdmin
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        action_type: 'vendor_verification',
        action_details: {
          target_vendor_id: vendorId,
          verification_type: verificationType,
          status: status,
          notes: notes
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: `Vendor ${verificationType} verification ${status ? 'approved' : 'revoked'} successfully`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in verify-vendor function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
