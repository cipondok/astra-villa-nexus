import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IndonesianValidationRequest {
  field: string;
  value: any;
  vendor_type: 'product' | 'service';
  language: 'en' | 'id';
  application_id?: string;
}

interface BPJSVerificationRequest {
  vendor_id: string;
  bpjs_type: 'ketenagakerjaan' | 'kesehatan';
  verification_number: string;
}

interface LocationValidationRequest {
  province_code: string;
  city_code?: string;
  postal_code?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    console.log('Indonesian validation action:', action);

    if (action === 'validate-field') {
      return await validateIndonesianField(req, supabaseClient);
    } else if (action === 'verify-bpjs') {
      return await verifyBPJS(req, supabaseClient);
    } else if (action === 'validate-location') {
      return await validateLocation(req, supabaseClient);
    } else if (action === 'validate-license') {
      return await validateLicense(req, supabaseClient);
    } else if (action === 'get-categories') {
      return await getIndonesianCategories(req, supabaseClient);
    } else if (action === 'get-provinces') {
      return await getProvinces(req, supabaseClient);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Indonesian validation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function validateIndonesianField(req: Request, supabase: any) {
  const { field, value, vendor_type, language = 'id', application_id }: IndonesianValidationRequest = await req.json();

  console.log('Validating Indonesian field:', { field, value, vendor_type, language });

  // Get Indonesian validation rules
  const { data: rules, error: rulesError } = await supabase
    .from('indonesian_validation_rules')
    .select('*')
    .eq('field_name', field)
    .in('vendor_type', [vendor_type, 'both'])
    .eq('is_active', true);

  if (rulesError) {
    console.error('Error fetching validation rules:', rulesError);
    throw new Error(`Failed to fetch validation rules: ${rulesError.message}`);
  }

  console.log('Found validation rules:', rules?.length || 0);

  const results = [];
  
  for (const rule of rules || []) {
    const result = await applyIndonesianValidationRule(rule, value, supabase, language);
    results.push(result);
    
    // Log validation attempt
    if (application_id && result.valid !== undefined) {
      await supabase
        .from('validation_logs')
        .insert({
          application_id,
          field_name: field,
          field_value: value?.toString(),
          validation_result: result.valid ? 'pass' : 'fail',
          error_message: result.error_message
        });
    }
  }

  // Return the first failure or success if all pass
  const failedResult = results.find(r => !r.valid);
  const response = failedResult || { valid: true, message: language === 'id' ? 'Validasi berhasil' : 'Validation passed' };

  return new Response(
    JSON.stringify(response),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function applyIndonesianValidationRule(rule: any, value: any, supabase: any, language: string) {
  const logic = rule.validation_logic;

  console.log('Applying rule:', rule.field_name, rule.validation_type);

  switch (rule.validation_type) {
    case 'regex':
      const pattern = new RegExp(logic.pattern);
      if (!pattern.test(value)) {
        return { 
          valid: false, 
          error_message: language === 'id' ? rule.error_message_id : rule.error_message_en,
          severity: rule.severity 
        };
      }
      break;

    case 'range':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { 
          valid: false, 
          error_message: language === 'id' ? 'Nilai harus berupa angka' : 'Value must be a number',
          severity: rule.severity 
        };
      }
      if (logic.min && numValue < logic.min) {
        return { 
          valid: false, 
          error_message: language === 'id' ? rule.error_message_id : rule.error_message_en,
          severity: rule.severity 
        };
      }
      if (logic.max && numValue > logic.max) {
        return { 
          valid: false, 
          error_message: language === 'id' ? rule.error_message_id : rule.error_message_en,
          severity: rule.severity 
        };
      }
      break;

    case 'required':
      if (!value || value.toString().trim() === '') {
        return { 
          valid: false, 
          error_message: language === 'id' ? rule.error_message_id : rule.error_message_en,
          severity: rule.severity 
        };
      }
      break;

    case 'api_check':
      // Implement API check for licenses (LPJK, etc.)
      if (rule.field_name === 'nomor_skt' || rule.field_name === 'nomor_iujk') {
        return await checkLicenseWithAPI(rule.field_name, value, supabase, language);
      }
      break;
  }

  return { valid: true };
}

async function checkLicenseWithAPI(licenseType: string, licenseNumber: string, supabase: any, language: string) {
  try {
    // Mock API check - in real implementation, call LPJK API
    console.log('Checking license with API:', licenseType, licenseNumber);
    
    // Simulate API response
    const isValid = licenseNumber.includes('123456'); // Mock validation
    
    if (!isValid) {
      return {
        valid: false,
        error_message: language === 'id' 
          ? `Nomor ${licenseType.toUpperCase()} tidak valid atau tidak aktif`
          : `${licenseType.toUpperCase()} number is invalid or inactive`,
        severity: 'error',
        api_checked: true
      };
    }

    return { valid: true, api_checked: true };
  } catch (error) {
    console.error('License API check failed:', error);
    return {
      valid: false,
      error_message: language === 'id' 
        ? 'Gagal memverifikasi lisensi. Coba lagi nanti.'
        : 'Failed to verify license. Please try again later.',
      severity: 'warning'
    };
  }
}

async function verifyBPJS(req: Request, supabase: any) {
  const { vendor_id, bpjs_type, verification_number }: BPJSVerificationRequest = await req.json();

  console.log('Verifying BPJS:', { vendor_id, bpjs_type, verification_number });

  try {
    // Mock BPJS API verification - in real implementation, call BPJS API
    const isValid = verification_number.length >= 8; // Mock validation
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Save verification result
    const { data, error } = await supabase
      .from('bpjs_verifications')
      .insert({
        vendor_id,
        bpjs_type,
        verification_number,
        verification_status: isValid ? 'active' : 'invalid',
        verified_at: isValid ? new Date().toISOString() : null,
        expires_at: isValid ? expiresAt.toISOString() : null,
        verification_response: {
          api_response: `Mock ${bpjs_type} verification`,
          checked_at: new Date().toISOString()
        },
        is_valid: isValid
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        valid: isValid,
        verification_id: data.id,
        status: data.verification_status,
        expires_at: data.expires_at,
        message: isValid 
          ? `BPJS ${bpjs_type} terverifikasi dan aktif`
          : `BPJS ${bpjs_type} tidak valid atau tidak aktif`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('BPJS verification error:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Gagal memverifikasi BPJS. Silakan coba lagi.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function validateLocation(req: Request, supabase: any) {
  const { province_code, city_code, postal_code }: LocationValidationRequest = await req.json();

  console.log('Validating location:', { province_code, city_code, postal_code });

  const { data: location, error } = await supabase
    .from('indonesian_locations')
    .select('*')
    .eq('province_code', province_code)
    .eq('city_code', city_code || '')
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const isValid = !!location;

  return new Response(
    JSON.stringify({
      valid: isValid,
      location: location || null,
      message: isValid 
        ? 'Lokasi valid'
        : 'Kode provinsi/kota tidak valid'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function validateLicense(req: Request, supabase: any) {
  const { license_type, license_number, vendor_type } = await req.json();

  console.log('Validating license:', { license_type, license_number, vendor_type });

  // Get license type info
  const { data: licenseType, error: licenseError } = await supabase
    .from('indonesian_license_types')
    .select('*')
    .eq('license_code', license_type)
    .in('vendor_type', [vendor_type, 'both'])
    .eq('is_active', true)
    .single();

  if (licenseError || !licenseType) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Tipe lisensi tidak valid'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate format
  const pattern = new RegExp(licenseType.validation_regex);
  const formatValid = pattern.test(license_number);

  if (!formatValid) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: `Format ${license_type} tidak valid`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Mock API verification
  const apiValid = license_number.includes('123456'); // Mock check

  return new Response(
    JSON.stringify({
      valid: apiValid,
      format_valid: formatValid,
      license_info: licenseType,
      message: apiValid 
        ? `${license_type} valid dan aktif`
        : `${license_type} tidak ditemukan atau tidak aktif`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getIndonesianCategories(req: Request, supabase: any) {
  const url = new URL(req.url);
  const vendor_type = url.searchParams.get('vendor_type');
  const parent_id = url.searchParams.get('parent_id');
  const level = url.searchParams.get('level');
  const language = url.searchParams.get('language') || 'id';

  console.log('Getting Indonesian categories:', { vendor_type, parent_id, level, language });

  let query = supabase
    .from('indonesian_business_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (vendor_type) {
    query = query.in('vendor_type', [vendor_type, 'both']);
  }

  if (parent_id) {
    query = query.eq('parent_id', parent_id);
  } else if (level === '1') {
    query = query.is('parent_id', null);
  }

  if (level) {
    query = query.eq('level', parseInt(level));
  }

  const { data: categories, error } = await query;

  if (error) {
    throw error;
  }

  // Transform for response
  const transformedCategories = categories?.map(cat => ({
    id: cat.id,
    code: cat.category_code,
    name: language === 'id' ? cat.name_id : cat.name_en,
    description: language === 'id' ? cat.description_id : cat.description_en,
    level: cat.level,
    vendor_type: cat.vendor_type,
    parent_id: cat.parent_id,
    required_licenses: cat.required_licenses || [],
    icon: cat.icon,
    display_order: cat.display_order
  })) || [];

  return new Response(
    JSON.stringify({
      categories: transformedCategories,
      total: transformedCategories.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getProvinces(req: Request, supabase: any) {
  const url = new URL(req.url);
  const province_code = url.searchParams.get('province_code');

  console.log('Getting provinces/cities:', { province_code });

  let query = supabase
    .from('indonesian_locations')
    .select('*')
    .eq('is_active', true);

  if (province_code) {
    // Get cities for specific province
    query = query.eq('province_code', province_code).not('city_code', 'is', null);
  } else {
    // Get all provinces
    query = query.is('city_code', null);
  }

  query = query.order('province_name', { ascending: true });

  const { data: locations, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      locations: locations || [],
      total: locations?.length || 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}