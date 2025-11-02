import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('get-verification-requests function called');

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

    // Create service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get parameters from request body
    const requestBody = await req.json();
    const type = requestBody.type || 'all'; // 'owners', 'vendors', 'all'
    const status = requestBody.status || 'pending'; // 'pending', 'verified', 'all'
    
    console.log('Request parameters:', { type, status });

    const results: any = {
      owners: [],
      vendors: []
    };

    // Fetch owner verification requests
    if (type === 'owners' || type === 'all') {
      let ownerQuery = supabaseAdmin
        .from('user_verification')
        .select(`
          *,
          profiles!user_verification_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (status === 'pending') {
        ownerQuery = ownerQuery.or('identity_verified.eq.false,email_verified.eq.false,phone_verified.eq.false');
      } else if (status === 'verified') {
        ownerQuery = ownerQuery.eq('identity_verified', true);
      }

      const { data: ownerData, error: ownerError } = await ownerQuery.limit(100);

      if (ownerError) {
        console.error('Error fetching owner verifications:', ownerError);
      } else {
        results.owners = ownerData || [];
        console.log(`Found ${results.owners.length} owner verification requests`);
      }
    }

    // Fetch vendor verification requests
    if (type === 'vendors' || type === 'all') {
      let vendorQuery = supabaseAdmin
        .from('vendor_profiles')
        .select(`
          *,
          profiles!vendor_profiles_vendor_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (status === 'pending') {
        vendorQuery = vendorQuery.eq('is_verified', false);
      } else if (status === 'verified') {
        vendorQuery = vendorQuery.eq('is_verified', true);
      }

      const { data: vendorData, error: vendorError } = await vendorQuery.limit(100);

      if (vendorError) {
        console.error('Error fetching vendor verifications:', vendorError);
      } else {
        results.vendors = vendorData || [];
        console.log(`Found ${results.vendors.length} vendor verification requests`);
      }
    }

    // Get statistics
    const stats = {
      totalOwners: results.owners.length,
      totalVendors: results.vendors.length,
      pendingOwners: results.owners.filter((o: any) => 
        !o.identity_verified || !o.email_verified || !o.phone_verified
      ).length,
      pendingVendors: results.vendors.filter((v: any) => !v.is_verified).length,
      verifiedOwners: results.owners.filter((o: any) => 
        o.identity_verified && o.email_verified && o.phone_verified
      ).length,
      verifiedVendors: results.vendors.filter((v: any) => v.is_verified).length
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        stats: stats
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in get-verification-requests function:', error);
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
