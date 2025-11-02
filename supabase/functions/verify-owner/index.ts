import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  userId: string;
  verificationType: 'identity' | 'email' | 'phone';
  status: boolean;
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('verify-owner function called');

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

    // Check if user has admin role using has_role function
    const { data: isAdmin, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError);
      throw new Error('Admin access required');
    }

    console.log('Admin verified');

    // Parse request body
    const { userId, verificationType, status, notes }: VerificationRequest = await req.json();

    if (!userId || !verificationType) {
      throw new Error('Missing required fields: userId, verificationType');
    }

    console.log('Verification request:', { userId, verificationType, status });

    // Create service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Check if user_verification record exists
    const { data: existingVerification } = await supabaseAdmin
      .from('user_verification')
      .select('*')
      .eq('user_id', userId)
      .single();

    const timestamp = new Date().toISOString();
    const updateData: any = {
      verified_by: user.id,
      verification_notes: notes || null
    };

    // Set the appropriate verification field
    switch (verificationType) {
      case 'identity':
        updateData.identity_verified = status;
        updateData.identity_verified_at = status ? timestamp : null;
        break;
      case 'email':
        updateData.email_verified = status;
        updateData.email_verified_at = status ? timestamp : null;
        break;
      case 'phone':
        updateData.phone_verified = status;
        updateData.phone_verified_at = status ? timestamp : null;
        break;
    }

    let result;

    if (existingVerification) {
      // Update existing verification
      const { data, error } = await supabaseAdmin
        .from('user_verification')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      result = data;
      console.log('Updated verification:', result);
    } else {
      // Insert new verification record
      const { data, error } = await supabaseAdmin
        .from('user_verification')
        .insert({
          user_id: userId,
          ...updateData
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      result = data;
      console.log('Created verification:', result);
    }

    // Log admin action
    await supabaseAdmin
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        action_type: 'owner_verification',
        action_details: {
          target_user_id: userId,
          verification_type: verificationType,
          status: status,
          notes: notes
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: `Owner verification ${status ? 'approved' : 'revoked'} successfully`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in verify-owner function:', error);
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
