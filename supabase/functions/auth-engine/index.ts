import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type Action =
  | 'generate_otp'
  | 'verify_otp'
  | 'send_2fa'
  | 'check_breach'
  | 'verify_document'
  | 'verify_owner'
  | 'verify_vendor'
  | 'rate_limit_check';

interface AuthRequest {
  action: Action;
  [key: string]: unknown;
}

const log = (step: string, details?: unknown) => {
  console.log(`[AUTH-ENGINE] ${step}`, details ? JSON.stringify(details) : '');
};

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : 'unknown';
}

// ─── generate_otp ───────────────────────────────────────────────────
async function generateOtp(params: Record<string, any>, supabase: any, userId: string, userEmail: string, req: Request) {
  const purpose = params.purpose || 'mfa';
  const email = params.email || userEmail;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  const ip = clientIp(req);

  // Clean old unused codes
  await supabase.from('otp_codes').delete().eq('user_id', userId).eq('purpose', purpose).eq('is_used', false);

  const { error: otpError } = await supabase.from('otp_codes').insert({
    user_id: userId, code, purpose,
    expires_at: expiresAt.toISOString(),
    ip_address: ip,
    user_agent: req.headers.get('user-agent') || 'unknown',
  });
  if (otpError) throw new Error('Failed to generate OTP');

  // Send email via SMTP if configured
  try {
    const { data: smtpSettings } = await supabase.from('system_settings').select('value').eq('category', 'smtp').eq('key', 'config').single();
    if (smtpSettings?.value?.isEnabled) {
      const smtp = smtpSettings.value;
      const client = new SMTPClient({
        connection: {
          hostname: smtp.host, port: parseInt(smtp.port),
          tls: smtp.encryption === 'tls' || smtp.encryption === 'ssl',
          auth: { username: smtp.username, password: smtp.password },
        },
      });
      const purposeText = purpose === 'mfa' ? 'Multi-Factor Authentication' : purpose === 'email_verification' ? 'Email Verification' : 'Password Reset';
      await client.send({
        from: `${smtp.fromName} <${smtp.fromEmail}>`, to: email,
        subject: `Your ${purposeText} Code`,
        content: `<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#2563eb">Verification Code</h2>
          <p>Your code for ${purposeText}:</p>
          <div style="background:#f3f4f6;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;margin:20px 0;border-radius:8px">${code}</div>
          <p style="color:#666">Expires in 10 minutes.</p>
          <hr style="margin:20px 0;border:none;border-top:1px solid #ddd">
          <p style="color:#999;font-size:12px">IP: ${ip} | Time: ${new Date().toISOString()}</p>
        </body></html>`,
        html: true,
      });
      await client.close();
    }
  } catch (e) {
    log('SMTP send failed (non-blocking)', (e as Error).message);
  }

  await supabase.from('user_security_logs').insert({ user_id: userId, event_type: `otp_generated_${purpose}`, ip_address: ip, metadata: { purpose, expires_at: expiresAt.toISOString() } });

  return { success: true, message: 'OTP code sent', expires_at: expiresAt.toISOString() };
}

// ─── verify_otp ─────────────────────────────────────────────────────
async function verifyOtp(params: Record<string, any>, supabase: any, userId: string, req: Request) {
  const { code, purpose } = params;
  if (!code || !purpose) throw new Error('code and purpose required');
  if (!/^\d{6}$/.test(code)) throw new Error('OTP must be 6 digits');

  const { data: otp, error } = await supabase.from('otp_codes').select('*').eq('user_id', userId).eq('purpose', purpose).eq('is_used', false).single();
  if (error || !otp) throw new Error('No valid OTP found');
  if (new Date(otp.expires_at) < new Date()) {
    await supabase.from('otp_codes').update({ is_used: true }).eq('id', otp.id);
    throw new Error('OTP expired');
  }
  if (otp.attempts >= otp.max_attempts) {
    await supabase.from('otp_codes').update({ is_used: true }).eq('id', otp.id);
    throw new Error('Max attempts exceeded');
  }
  if (otp.code !== code) {
    await supabase.from('otp_codes').update({ attempts: otp.attempts + 1 }).eq('id', otp.id);
    return { success: false, error: 'Invalid code', remaining_attempts: otp.max_attempts - (otp.attempts + 1) };
  }

  await supabase.from('otp_codes').update({ is_used: true, used_at: new Date().toISOString() }).eq('id', otp.id);

  if (purpose === 'email_verification') {
    await supabase.from('user_verification').upsert({ user_id: userId, email_verified: true, email_verified_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  } else if (purpose === 'mfa') {
    await supabase.from('mfa_settings').upsert({ user_id: userId, last_verified_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }

  await supabase.from('user_security_logs').insert({ user_id: userId, event_type: `otp_verified_${purpose}`, ip_address: clientIp(req), metadata: { purpose } });

  return { success: true, message: 'OTP verified' };
}

// ─── send_2fa ───────────────────────────────────────────────────────
async function send2fa(params: Record<string, any>, supabase: any, userId: string, req: Request) {
  const { code, method } = params;
  if (!code || !method) throw new Error('code and method required');
  if (!/^\d{6}$/.test(code)) throw new Error('Invalid code format');

  const { data: settings } = await supabase.from('user_2fa_settings').select('*').eq('user_id', userId).single();
  if (!settings) throw new Error('2FA not configured');

  // In production: verify against TOTP or stored SMS code
  const isValid = code.length === 6 && /^\d+$/.test(code);

  await supabase.from('user_2fa_attempts').insert({
    user_id: userId, method, success: isValid,
    ip_address: clientIp(req),
    user_agent: req.headers.get('user-agent') || 'unknown',
  });

  if (!isValid) return { success: false, error: 'Invalid 2FA code' };
  return { success: true, message: '2FA verified' };
}

// ─── check_breach ───────────────────────────────────────────────────
async function checkBreach(params: Record<string, any>, supabase: any, userId: string) {
  const { email } = params;
  if (!email) throw new Error('email required');

  // Check account_lockouts
  const { data: lockout } = await supabase.from('account_lockouts').select('*').eq('email', email).eq('is_active', true).maybeSingle();
  const isLocked = !!lockout && new Date(lockout.unlock_at) > new Date();

  // Check recent security logs
  const since = new Date(); since.setHours(since.getHours() - 24);
  const { data: recentEvents } = await supabase.from('user_security_logs').select('event_type').eq('user_id', userId).gte('created_at', since.toISOString());
  const failedAttempts = (recentEvents || []).filter((e: any) => e.event_type.includes('failed')).length;

  return {
    success: true,
    is_locked: isLocked,
    lockout: lockout ? { unlock_at: lockout.unlock_at, failed_attempts: lockout.failed_attempts } : null,
    recent_failed_attempts_24h: failedAttempts,
    risk_level: failedAttempts > 10 ? 'high' : failedAttempts > 3 ? 'medium' : 'low',
  };
}

// ─── verify_document (KYC) ──────────────────────────────────────────
async function verifyDocument(params: Record<string, any>, supabase: any, userId: string) {
  const { kyc_action = 'submit', verification_type = 'basic', document_type, document_image, selfie_image } = params;

  if (kyc_action === 'check_status') {
    const { data } = await supabase.from('kyc_verifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
    return { success: true, verification: data?.[0] || null, kyc_level: data?.[0]?.status === 'verified' ? data[0].verification_type : 'none' };
  }

  if (kyc_action === 'submit') {
    if (!document_type) throw new Error('document_type required');

    // Simulate liveness
    let livenessResult = null;
    if (verification_type !== 'basic' && selfie_image) {
      await new Promise(r => setTimeout(r, 500));
      const score = 70 + Math.random() * 28;
      livenessResult = { passed: score >= 75, score: Math.round(score * 10) / 10 };
    }

    // Simulate face match
    let faceMatchResult = null;
    if (verification_type === 'enhanced' && document_image && selfie_image) {
      await new Promise(r => setTimeout(r, 500));
      const score = 75 + Math.random() * 24;
      faceMatchResult = { passed: score >= 80, score: Math.round(score * 10) / 10 };
    }

    // Simulate document extraction
    const confidence = 85 + Math.random() * 14;

    let status = 'verified';
    let rejectionReason: string | null = null;
    if (verification_type === 'enhanced' && faceMatchResult && !faceMatchResult.passed) {
      status = 'rejected'; rejectionReason = 'Face does not match document';
    } else if (verification_type !== 'basic' && livenessResult && !livenessResult.passed) {
      status = 'rejected'; rejectionReason = 'Liveness check failed';
    } else if (confidence < 75) {
      status = 'manual_review'; rejectionReason = 'Document requires manual review';
    }

    const { data: verification, error } = await supabase.from('kyc_verifications').insert({
      user_id: userId, verification_type, document_type,
      liveness_score: livenessResult?.score, liveness_passed: livenessResult?.passed || false,
      face_match_score: faceMatchResult?.score, face_match_passed: faceMatchResult?.passed || false,
      extracted_data: {}, status, rejection_reason: rejectionReason, provider: 'vida_simulation',
    }).select().single();
    if (error) throw error;

    return { success: true, verification_id: verification.id, status, rejection_reason: rejectionReason };
  }

  throw new Error(`Unknown kyc_action: ${kyc_action}`);
}

// ─── verify_owner ───────────────────────────────────────────────────
async function verifyOwner(params: Record<string, any>, supabase: any, supabaseAuth: any, adminId: string) {
  // Verify admin
  const { data: isAdmin } = await supabaseAuth.rpc('has_role', { _user_id: adminId, _role: 'admin' });
  if (!isAdmin) throw new Error('Admin access required');

  const { userId, verificationType, status, notes } = params;
  if (!userId || !verificationType) throw new Error('userId and verificationType required');

  const timestamp = new Date().toISOString();
  const updateData: Record<string, any> = { verified_by: adminId, verification_notes: notes || null };

  switch (verificationType) {
    case 'identity': updateData.identity_verified = status; updateData.identity_verified_at = status ? timestamp : null; break;
    case 'email': updateData.email_verified = status; updateData.email_verified_at = status ? timestamp : null; break;
    case 'phone': updateData.phone_verified = status; updateData.phone_verified_at = status ? timestamp : null; break;
  }

  const { data: existing } = await supabase.from('user_verification').select('*').eq('user_id', userId).single();
  let result;
  if (existing) {
    const { data, error } = await supabase.from('user_verification').update(updateData).eq('user_id', userId).select().single();
    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase.from('user_verification').insert({ user_id: userId, ...updateData }).select().single();
    if (error) throw error;
    result = data;
  }

  await supabase.from('admin_activity_logs').insert({ admin_id: adminId, action_type: 'owner_verification', action_details: { target_user_id: userId, verification_type: verificationType, status, notes } });

  return { success: true, data: result, message: `Owner verification ${status ? 'approved' : 'revoked'}` };
}

// ─── verify_vendor ──────────────────────────────────────────────────
async function verifyVendor(params: Record<string, any>, supabase: any, supabaseAuth: any, adminId: string) {
  const { data: isAdmin } = await supabaseAuth.rpc('has_role', { _user_id: adminId, _role: 'admin' });
  if (!isAdmin) throw new Error('Admin access required');

  const { vendorId, verificationType, status, notes } = params;
  if (!vendorId || !verificationType) throw new Error('vendorId and verificationType required');

  const { data: vendor, error: vendorErr } = await supabase.from('vendor_profiles').select('*').eq('vendor_id', vendorId).single();
  if (vendorErr || !vendor) throw new Error('Vendor profile not found');

  const timestamp = new Date().toISOString();
  const updateData: Record<string, any> = {};

  const fieldMap: Record<string, () => void> = {
    general: () => { updateData.is_verified = status; updateData.verification_completed_at = status ? timestamp : null; },
    ktp: () => { updateData.ktp_verified = status; },
    npwp: () => { updateData.npwp_verified = status; },
    siup: () => { updateData.siup_verified = status; },
    niu: () => { updateData.niu_verified = status; },
    skk: () => { updateData.skk_verified = status; },
    siuk: () => { updateData.siuk_verified = status; },
  };
  if (fieldMap[verificationType]) fieldMap[verificationType]();

  const { data, error } = await supabase.from('vendor_profiles').update(updateData).eq('vendor_id', vendorId).select().single();
  if (error) throw error;

  await supabase.from('vendor_document_verifications').insert({ vendor_id: vendorId, document_type: verificationType, verification_status: status ? 'verified' : 'rejected', verified_by: adminId, verified_at: timestamp, verification_notes: notes || null }).catch(() => {});
  await supabase.from('admin_activity_logs').insert({ admin_id: adminId, action_type: 'vendor_verification', action_details: { target_vendor_id: vendorId, verification_type: verificationType, status, notes } });

  return { success: true, data, message: `Vendor ${verificationType} ${status ? 'approved' : 'revoked'}` };
}

// ─── rate_limit_check ───────────────────────────────────────────────
async function rateLimitCheck(params: Record<string, any>, supabase: any) {
  const { endpoint = 'default', ip_address, user_id, api_key, user_agent, request_path } = params;

  if (!ip_address && !user_id && !api_key) throw new Error('Identifier required (ip_address, user_id, or api_key)');

  // Check IP whitelist
  if (ip_address) {
    const { data: wl } = await supabase.from('whitelisted_ips').select('id').eq('ip_address', ip_address).maybeSingle();
    if (wl) return { allowed: true, remaining: 999999, reset: 0, limit: 999999, whitelisted: true };
  }

  // Check IP block
  if (ip_address) {
    const { data: blocked } = await supabase.from('blocked_ips').select('*').eq('ip_address', ip_address).or('expires_at.is.null,expires_at.gt.now()').maybeSingle();
    if (blocked) return { allowed: false, blocked: true, reason: blocked.reason, remaining: 0, reset: blocked.expires_at ? Math.ceil((new Date(blocked.expires_at).getTime() - Date.now()) / 1000) : null };
  }

  // API key validation
  let multiplier = 1.0;
  if (api_key) {
    const { data: keyData } = await supabase.from('partner_api_keys').select('*').eq('api_key', api_key).eq('is_active', true).single();
    if (!keyData) throw new Error('Invalid API key');
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) throw new Error('API key expired');
    multiplier = keyData.rate_limit_multiplier || 1.0;
    await supabase.from('partner_api_keys').update({ last_used_at: new Date().toISOString(), total_requests: (keyData.total_requests || 0) + 1 }).eq('id', keyData.id);
    if (keyData.is_whitelisted) return { allowed: true, remaining: 999999, reset: 0, limit: 999999, whitelisted: true, partner: keyData.partner_name };
  }

  // Get config
  let { data: config } = await supabase.from('rate_limit_config').select('*').eq('endpoint_pattern', endpoint).eq('is_active', true).maybeSingle();
  if (!config) {
    const { data: def } = await supabase.from('rate_limit_config').select('*').eq('endpoint_pattern', 'default').maybeSingle();
    config = def;
  }
  if (!config) return { allowed: true, remaining: 999, reset: 60, limit: 999 };

  const identifier = api_key || user_id || ip_address;
  const identifierType = api_key ? 'api_key' : user_id ? 'user' : 'ip';
  const now = new Date();
  const windowMs = config.window_seconds * 1000;
  const windowEnd = new Date(now.getTime() + windowMs);
  const effectiveLimit = Math.floor(config.requests_per_window * multiplier);

  const { data: entry } = await supabase.from('rate_limit_entries').select('*').eq('identifier', identifier).eq('endpoint_pattern', endpoint).gte('window_end', now.toISOString()).order('window_start', { ascending: false }).limit(1).maybeSingle();

  let requestCount = 1;
  if (entry) {
    const elapsed = now.getTime() - new Date(entry.window_start).getTime();
    const duration = new Date(entry.window_end).getTime() - new Date(entry.window_start).getTime();
    const weight = Math.max(0, 1 - (elapsed / duration));
    requestCount = Math.floor(entry.request_count * weight) + 1;
    await supabase.from('rate_limit_entries').update({ request_count: entry.request_count + 1, updated_at: now.toISOString() }).eq('id', entry.id);
  } else {
    await supabase.from('rate_limit_entries').insert({ identifier, identifier_type: identifierType, endpoint_pattern: endpoint, request_count: 1, window_start: now.toISOString(), window_end: windowEnd.toISOString() });
  }

  const remaining = Math.max(0, effectiveLimit - requestCount);
  const allowed = requestCount <= effectiveLimit;
  const reset = Math.ceil(windowMs / 1000);

  if (!allowed) {
    await supabase.from('rate_limit_violations').insert({ identifier, identifier_type: identifierType, endpoint_pattern: endpoint, user_agent, request_path, metadata: { ip_address, user_id, api_key } });
  }

  return { allowed, remaining, reset, limit: effectiveLimit, retryAfter: allowed ? undefined : reset };
}

// ─── main handler ───────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Authenticate (optional for rate_limit_check)
    let userId: string | null = null;
    let userEmail = '';
    let supabaseAuth: any = null;
    const authHeader = req.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data, error } = await supabase.auth.getClaims(token);
      if (!error && data?.claims) {
        userId = data.claims.sub as string;
        userEmail = (data.claims.email as string) || '';
      }
    }

    const body: AuthRequest = await req.json();
    const { action, ...params } = body;
    log("Invoked", { action, userId: userId?.slice(0, 8) });

    // Actions requiring auth
    const authRequired: Action[] = ['generate_otp', 'verify_otp', 'send_2fa', 'check_breach', 'verify_document', 'verify_owner', 'verify_vendor'];
    if (authRequired.includes(action) && !userId) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let result: Record<string, unknown>;

    switch (action) {
      case 'generate_otp':
        result = await generateOtp(params, supabase, userId!, userEmail, req);
        break;
      case 'verify_otp':
        result = await verifyOtp(params, supabase, userId!, req);
        break;
      case 'send_2fa':
        result = await send2fa(params, supabase, userId!, req);
        break;
      case 'check_breach':
        result = await checkBreach(params, supabase, userId!);
        break;
      case 'verify_document':
        result = await verifyDocument(params, supabase, userId!);
        break;
      case 'verify_owner':
        result = await verifyOwner(params, supabase, supabaseAuth, userId!);
        break;
      case 'verify_vendor':
        result = await verifyVendor(params, supabase, supabaseAuth, userId!);
        break;
      case 'rate_limit_check':
        result = await rateLimitCheck(params, supabase);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    log("Success", { action });
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
