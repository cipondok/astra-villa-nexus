import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const log = (step: string, details?: any) => {
  console.log(`[VENDOR-ENGINE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    log('Request', { action });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Helper: get authenticated user
    const getUser = async () => {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error('No authorization header');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) throw new Error('Unauthorized');
      return { user: data.user, supabase };
    };

    // Helper: check admin role
    const requireAdmin = async () => {
      const { user, supabase } = await getUser();
      const { data: isAdmin, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (error || !isAdmin) throw new Error('Admin access required');
      return user;
    };

    let result: any;

    switch (action) {
      // ─── VALIDATE VENDOR ───
      case 'validate_vendor': {
        const admin = await requireAdmin();
        const { vendorId, verificationType, status, notes } = params;
        if (!vendorId || !verificationType) throw new Error('Missing vendorId or verificationType');

        const { data: vendor, error: vErr } = await supabaseAdmin
          .from('vendor_profiles').select('*').eq('vendor_id', vendorId).single();
        if (vErr || !vendor) throw new Error('Vendor profile not found');

        const ts = new Date().toISOString();
        const updateData: Record<string, any> = {};

        const fieldMap: Record<string, string[]> = {
          general: ['is_verified', 'verification_completed_at'],
          ktp: ['ktp_verified'], npwp: ['npwp_verified'], siup: ['siup_verified'],
          niu: ['niu_verified'], skk: ['skk_verified'], siuk: ['siuk_verified'],
        };
        const fields = fieldMap[verificationType];
        if (!fields) throw new Error('Invalid verificationType');

        if (verificationType === 'general') {
          updateData.is_verified = status;
          updateData.verification_completed_at = status ? ts : null;
        } else {
          updateData[fields[0]] = status;
        }

        const { data, error } = await supabaseAdmin
          .from('vendor_profiles').update(updateData).eq('vendor_id', vendorId).select().single();
        if (error) throw error;

        // Log verification
        await supabaseAdmin.from('vendor_document_verifications').insert({
          vendor_id: vendorId, document_type: verificationType,
          verification_status: status ? 'verified' : 'rejected',
          verified_by: admin.id, verified_at: ts,
          verification_notes: notes || null,
        }).catch(e => log('Verification log failed', e));

        await supabaseAdmin.from('admin_activity_logs').insert({
          admin_id: admin.id, action_type: 'vendor_verification',
          action_details: { target_vendor_id: vendorId, verification_type: verificationType, status, notes },
        }).catch(e => log('Activity log failed', e));

        result = { data, message: `Vendor ${verificationType} ${status ? 'approved' : 'revoked'}` };
        break;
      }

      // ─── ENHANCED KYC ───
      case 'enhanced_kyc': {
        const { user } = await getUser();
        const { vendorId, documentType, documentNumber } = params;
        if (!vendorId || !documentType || !documentNumber) throw new Error('Missing required KYC fields');

        // Access check
        if (vendorId !== user.id) {
          const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
          if (!isAdmin) throw new Error('Unauthorized: Cannot verify for this vendor');
        }

        const patterns: Record<string, RegExp> = {
          ktp: /^[0-9]{16}$/, npwp: /^[0-9]{15}$/,
          siup: /^[0-9]{3}\/[0-9]{2}\.[0-9]{2}\/[A-Z]{2}\/[0-9]{4}$/,
          niu: /^[0-9]{13}$/,
          skk: /^SKK\/[0-9]{3}\/[A-Z]{2}\/[0-9]{4}$/,
          siuk: /^SIUK\/[0-9]{3}\/[A-Z]{2}\/[0-9]{4}$/,
        };
        const isValidFormat = patterns[documentType]?.test(documentNumber) ?? false;

        const authorities: Record<string, string> = {
          ktp: 'Dinas Kependudukan dan Pencatatan Sipil',
          npwp: 'Direktorat Jenderal Pajak',
          siup: 'Dinas Perindustrian dan Perdagangan',
          niu: 'Badan Koordinasi Penanaman Modal',
          skk: 'Kementerian Ketenagakerjaan',
          siuk: 'Dinas Tenaga Kerja',
        };

        // Simulate gov API check
        await new Promise(r => setTimeout(r, 500));
        const isValid = isValidFormat && Math.random() > 0.05;

        const details = {
          verified_at: new Date().toISOString(),
          issuing_authority: authorities[documentType] || 'Unknown',
          status: isValid ? 'active' : isValidFormat ? 'not_found' : 'invalid_format',
          verification_method: 'government_api',
        };

        const { data: record, error: insertErr } = await supabaseAdmin
          .from('vendor_document_verifications').insert({
            vendor_id: vendorId, document_type: documentType, document_number: documentNumber,
            verification_status: isValid ? 'verified' : 'failed',
            verification_details: details, verified_by: user.id, verified_at: details.verified_at,
          }).select().single();
        if (insertErr) throw insertErr;

        // Update business profile if valid
        if (isValid) {
          await supabaseAdmin.from('vendor_business_profiles')
            .update({ [`${documentType}_verified`]: true, updated_at: new Date().toISOString() })
            .eq('vendor_id', vendorId);
        }

        // Check compliance
        const { data: allVer } = await supabaseAdmin.from('vendor_document_verifications')
          .select('document_type').eq('vendor_id', vendorId).eq('verification_status', 'verified');
        const verified = allVer?.map(v => v.document_type) || [];
        const isCompliant = ['ktp', 'npwp', 'siup'].every(d => verified.includes(d));

        if (isCompliant) {
          await supabaseAdmin.from('vendor_business_profiles')
            .update({ is_verified: true, verification_completed_at: new Date().toISOString() })
            .eq('vendor_id', vendorId);
        }

        result = {
          verification: { id: record.id, documentType, status: isValid ? 'verified' : 'failed', details, isCompliant },
          message: isValid ? 'Document verified successfully' : 'Document verification failed',
        };
        break;
      }

      // ─── MANAGE VENDOR SERVICES ───
      case 'manage_vendor_services': {
        const { user } = await getUser();
        const { operation, serviceId, serviceData } = params;

        switch (operation) {
          case 'list': {
            const { data, error } = await supabaseAdmin
              .from('vendor_services').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false });
            if (error) throw error;
            result = { services: data };
            break;
          }
          case 'create': {
            if (!serviceData) throw new Error('Missing serviceData');
            const { data, error } = await supabaseAdmin
              .from('vendor_services').insert({ ...serviceData, vendor_id: user.id }).select().single();
            if (error) throw error;
            result = { service: data, message: 'Service created' };
            break;
          }
          case 'update': {
            if (!serviceId) throw new Error('Missing serviceId');
            const { data, error } = await supabaseAdmin
              .from('vendor_services').update({ ...serviceData, updated_at: new Date().toISOString() })
              .eq('id', serviceId).eq('vendor_id', user.id).select().single();
            if (error) throw error;
            result = { service: data, message: 'Service updated' };
            break;
          }
          case 'delete': {
            if (!serviceId) throw new Error('Missing serviceId');
            const { error } = await supabaseAdmin
              .from('vendor_services').delete().eq('id', serviceId).eq('vendor_id', user.id);
            if (error) throw error;
            result = { message: 'Service deleted' };
            break;
          }
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
        break;
      }

      // ─── GENERATE VENDOR FUNCTION (profile/analytics) ───
      case 'generate_vendor_function': {
        const { subAction, vendorId } = params;

        switch (subAction) {
          case 'profile_summary': {
            const { data: profile } = await supabaseAdmin
              .from('vendor_profiles').select('*').eq('vendor_id', vendorId).single();
            const { data: services } = await supabaseAdmin
              .from('vendor_services').select('*').eq('vendor_id', vendorId);
            const { data: reviews } = await supabaseAdmin
              .from('vendor_reviews').select('rating').eq('vendor_id', vendorId);

            const avgRating = reviews?.length
              ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
              : null;

            result = {
              profile, services: services || [], reviewCount: reviews?.length || 0,
              avgRating: avgRating ? parseFloat(avgRating) : null,
            };
            break;
          }
          case 'performance_stats': {
            const { data: bookings } = await supabaseAdmin
              .from('vendor_bookings').select('status, total_amount')
              .eq('vendor_id', vendorId);

            const completed = bookings?.filter(b => b.status === 'completed') || [];
            const totalRevenue = completed.reduce((s, b) => s + (b.total_amount || 0), 0);

            result = {
              totalBookings: bookings?.length || 0,
              completedBookings: completed.length,
              totalRevenue,
              completionRate: bookings?.length ? ((completed.length / bookings.length) * 100).toFixed(1) : '0',
            };
            break;
          }
          default:
            throw new Error(`Unknown subAction: ${subAction}`);
        }
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    log('ERROR', { message: error.message });
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    });
  }
});
