import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-forwarded-for, x-real-ip',
};

interface RateLimitConfig {
  endpoint_pattern: string;
  endpoint_name: string;
  requests_per_window: number;
  window_seconds: number;
  burst_limit: number | null;
  is_active: boolean;
  applies_to: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
  retryAfter?: number;
  blocked?: boolean;
  reason?: string;
}

// Sliding window rate limiting algorithm
async function checkRateLimit(
  supabase: any,
  identifier: string,
  identifierType: 'ip' | 'user' | 'api_key',
  endpoint: string,
  config: RateLimitConfig,
  multiplier: number = 1.0
): Promise<RateLimitResult> {
  const now = new Date();
  const windowMs = config.window_seconds * 1000;
  const windowStart = new Date(now.getTime() - windowMs);
  const windowEnd = new Date(now.getTime() + windowMs);
  const effectiveLimit = Math.floor(config.requests_per_window * multiplier);

  // Get current window entry
  const { data: entry, error: fetchError } = await supabase
    .from('rate_limit_entries')
    .select('*')
    .eq('identifier', identifier)
    .eq('endpoint_pattern', endpoint)
    .gte('window_end', now.toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching rate limit entry:', fetchError);
  }

  let requestCount = 1;
  
  if (entry) {
    // Sliding window calculation
    const entryStart = new Date(entry.window_start).getTime();
    const entryEnd = new Date(entry.window_end).getTime();
    const elapsed = now.getTime() - entryStart;
    const windowDuration = entryEnd - entryStart;
    
    // Calculate weighted count based on sliding window
    const weight = Math.max(0, 1 - (elapsed / windowDuration));
    requestCount = Math.floor(entry.request_count * weight) + 1;
    
    // Update existing entry
    await supabase
      .from('rate_limit_entries')
      .update({
        request_count: entry.request_count + 1,
        updated_at: now.toISOString()
      })
      .eq('id', entry.id);
  } else {
    // Create new entry
    await supabase
      .from('rate_limit_entries')
      .insert({
        identifier,
        identifier_type: identifierType,
        endpoint_pattern: endpoint,
        request_count: 1,
        window_start: now.toISOString(),
        window_end: windowEnd.toISOString()
      });
  }

  const remaining = Math.max(0, effectiveLimit - requestCount);
  const allowed = requestCount <= effectiveLimit;
  const reset = Math.ceil((windowMs - (now.getTime() % windowMs)) / 1000);

  return {
    allowed,
    remaining,
    reset,
    limit: effectiveLimit,
    retryAfter: allowed ? undefined : reset
  };
}

// Log violation
async function logViolation(
  supabase: any,
  identifier: string,
  identifierType: 'ip' | 'user' | 'api_key',
  endpoint: string,
  userAgent: string | null,
  requestPath: string | null,
  metadata: Record<string, any> = {}
) {
  await supabase.from('rate_limit_violations').insert({
    identifier,
    identifier_type: identifierType,
    endpoint_pattern: endpoint,
    user_agent: userAgent,
    request_path: requestPath,
    metadata
  });
}

// Update analytics
async function updateAnalytics(
  supabase: any,
  endpoint: string,
  blocked: boolean
) {
  const hourBucket = new Date();
  hourBucket.setMinutes(0, 0, 0);

  await supabase.rpc('upsert_rate_limit_analytics', {
    p_hour_bucket: hourBucket.toISOString(),
    p_endpoint: endpoint,
    p_blocked: blocked
  }).catch(() => {
    // Analytics update is non-critical
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const {
      endpoint = 'default',
      ip_address,
      user_id,
      api_key,
      user_agent,
      request_path
    } = body;

    if (!ip_address && !user_id && !api_key) {
      return new Response(
        JSON.stringify({ error: 'Missing identifier (ip_address, user_id, or api_key required)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if IP is whitelisted
    if (ip_address) {
      const { data: whitelisted } = await supabase
        .from('whitelisted_ips')
        .select('id')
        .eq('ip_address', ip_address)
        .single();
      
      if (whitelisted) {
        return new Response(
          JSON.stringify({
            allowed: true,
            remaining: 999999,
            reset: 0,
            limit: 999999,
            whitelisted: true
          }),
          { 
            status: 200, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': '999999',
              'X-RateLimit-Remaining': '999999',
              'X-RateLimit-Reset': '0'
            } 
          }
        );
      }
    }

    // Check if IP is blocked
    if (ip_address) {
      const { data: blocked } = await supabase
        .from('blocked_ips')
        .select('*')
        .eq('ip_address', ip_address)
        .or('expires_at.is.null,expires_at.gt.now()')
        .single();
      
      if (blocked) {
        console.log(`Blocked IP attempted access: ${ip_address}`);
        return new Response(
          JSON.stringify({
            allowed: false,
            blocked: true,
            reason: blocked.reason,
            remaining: 0,
            reset: blocked.expires_at 
              ? Math.ceil((new Date(blocked.expires_at).getTime() - Date.now()) / 1000)
              : null
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': '0',
              'X-RateLimit-Remaining': '0',
              'Retry-After': blocked.expires_at 
                ? Math.ceil((new Date(blocked.expires_at).getTime() - Date.now()) / 1000).toString()
                : '3600'
            } 
          }
        );
      }
    }

    // Check API key if provided
    let apiKeyMultiplier = 1.0;
    let apiKeyWhitelisted = false;
    
    if (api_key) {
      const { data: keyData } = await supabase
        .from('partner_api_keys')
        .select('*')
        .eq('api_key', api_key)
        .eq('is_active', true)
        .single();
      
      if (!keyData) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'API key expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      apiKeyMultiplier = keyData.rate_limit_multiplier || 1.0;
      apiKeyWhitelisted = keyData.is_whitelisted || false;
      
      // Update last used
      await supabase
        .from('partner_api_keys')
        .update({ 
          last_used_at: new Date().toISOString(),
          total_requests: (keyData.total_requests || 0) + 1
        })
        .eq('id', keyData.id);
      
      if (apiKeyWhitelisted) {
        return new Response(
          JSON.stringify({
            allowed: true,
            remaining: 999999,
            reset: 0,
            limit: 999999,
            whitelisted: true,
            partner: keyData.partner_name
          }),
          { 
            status: 200, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': '999999',
              'X-RateLimit-Remaining': '999999'
            } 
          }
        );
      }
    }

    // Get rate limit config for endpoint
    let { data: config } = await supabase
      .from('rate_limit_config')
      .select('*')
      .eq('endpoint_pattern', endpoint)
      .eq('is_active', true)
      .single();
    
    // Fall back to default config
    if (!config) {
      const { data: defaultConfig } = await supabase
        .from('rate_limit_config')
        .select('*')
        .eq('endpoint_pattern', 'default')
        .single();
      config = defaultConfig;
    }

    if (!config) {
      // No config found, allow request
      return new Response(
        JSON.stringify({ allowed: true, remaining: 999, reset: 60, limit: 999 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine primary identifier
    const identifier = api_key || user_id || ip_address;
    const identifierType: 'ip' | 'user' | 'api_key' = api_key 
      ? 'api_key' 
      : user_id 
        ? 'user' 
        : 'ip';

    // Check rate limit
    const result = await checkRateLimit(
      supabase,
      identifier,
      identifierType,
      endpoint,
      config,
      apiKeyMultiplier
    );

    // Log violation if rate limited
    if (!result.allowed) {
      await logViolation(
        supabase,
        identifier,
        identifierType,
        endpoint,
        user_agent,
        request_path,
        { ip_address, user_id, api_key }
      );
    }

    // Update analytics (fire and forget)
    updateAnalytics(supabase, endpoint, !result.allowed);

    const headers: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString()
    };

    if (!result.allowed && result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString();
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: result.allowed ? 200 : 429, 
        headers 
      }
    );
  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', allowed: true }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});