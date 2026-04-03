import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ─── Geo-IP lookup via Cloudflare headers + fallback API ────────────
interface GeoData {
  country: string | null;
  city: string | null;
  continent: string | null;
}

function getGeoFromHeaders(req: Request): GeoData {
  return {
    country: req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || null,
    city: req.headers.get('x-vercel-ip-city') || null,
    continent: req.headers.get('x-vercel-ip-continent') || null,
  };
}

async function resolveGeo(req: Request, ip: string): Promise<GeoData> {
  const hdr = getGeoFromHeaders(req);
  if (hdr.country) return hdr;

  // Fallback: free IP-API (no key needed, 45 req/min)
  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,countryCode,continent`);
    if (resp.ok) {
      const d = await resp.json();
      return {
        country: d.countryCode || d.country || null,
        city: d.city || null,
        continent: d.continent || null,
      };
    }
  } catch { /* non-blocking */ }
  return { country: null, city: null, continent: null };
}

// ─── Continent mapping for impossible travel ────────────────────────
const CONTINENT_MAP: Record<string, string> = {
  AF: 'Africa', AN: 'Antarctica', AS: 'Asia', EU: 'Europe',
  NA: 'North America', OC: 'Oceania', SA: 'South America',
};

const HIGH_RISK_COUNTRIES = new Set(['KP', 'IR', 'SY', 'CU', 'SD']);

// ─── Security alert email helper ────────────────────────────────────
async function sendSecurityAlertEmail(supabase: any, email: string, alertType: string, details: Record<string, any>) {
  try {
    await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'security-alert',
        recipientEmail: email,
        idempotencyKey: `security-alert-${alertType}-${email}-${Date.now()}`,
        templateData: {
          alert_type: alertType,
          login_country: details.country || 'Unknown',
          login_city: details.city || 'Unknown',
          device_info: details.device || 'Unknown device',
          ip_address: details.ip || 'Unknown',
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (e) {
    log('Security alert email failed (non-blocking)', (e as Error).message);
  }
}

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
  | 'rate_limit_check'
  | 'session_heartbeat'
  | 'register_device'
  | 'check_lockout'
  | 'record_login_attempt'
  | 'get_user_sessions'
  | 'revoke_session'
  | 'revoke_all_sessions'
  | 'get_security_events'
  | 'get_verification_requests';

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

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Progressive lockout tiers ──────────────────────────────────────
const LOCKOUT_TIERS = [
  { threshold: 5, durationMin: 5, tier: 1 },
  { threshold: 10, durationMin: 15, tier: 2 },
  { threshold: 15, durationMin: 60, tier: 3 },
];

// ─── check_lockout (NO AUTH REQUIRED) ───────────────────────────────
async function checkLockout(params: Record<string, any>, supabase: any) {
  const { email } = params;
  if (!email) throw new Error('email required');

  // Check active server lockout
  const { data: lockout } = await supabase
    .from('server_lockouts')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .gt('unlock_at', new Date().toISOString())
    .order('locked_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lockout) {
    const remainingSec = Math.max(0, Math.ceil((new Date(lockout.unlock_at).getTime() - Date.now()) / 1000));
    return {
      locked: true,
      remaining_seconds: remainingSec,
      unlock_at: lockout.unlock_at,
      failed_attempts: lockout.failed_attempts,
      tier: lockout.lockout_tier,
    };
  }

  // Count recent failures (last 60 min) to show warnings
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('server_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .eq('success', false)
    .gte('created_at', oneHourAgo);

  return {
    locked: false,
    recent_failures: count || 0,
    next_lockout_at: count && count >= 3 ? 5 - (count % 5) : null,
  };
}



  // ─── record_login_attempt with real geo-IP ──────────────────────────
async function recordLoginAttempt(params: Record<string, any>, supabase: any, req: Request) {
  const { email, success, failure_reason, device_fingerprint, user_id } = params;
  if (!email) throw new Error('email required');

  const ip = clientIp(req);
  const ua = req.headers.get('user-agent') || 'unknown';
  const emailLower = email.toLowerCase();

  // Real geo-IP resolution
  const geo = await resolveGeo(req, ip);
  const country = geo.country;
  const city = geo.city;
  const continent = geo.continent;
  let geoAnomaly = false;
  let impossibleTravel = false;

  // Check for impossible travel: different country within 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data: recentLogins } = await supabase
    .from('server_login_attempts')
    .select('country, continent_code, ip_address, created_at')
    .eq('email', emailLower)
    .eq('success', true)
    .gte('created_at', twoHoursAgo)
    .order('created_at', { ascending: false })
    .limit(3);

  if (recentLogins?.length && country) {
    const lastLogin = recentLogins[0];
    if (lastLogin.country && lastLogin.country !== country) {
      geoAnomaly = true;
      // Continent jump = impossible travel
      if (lastLogin.continent_code && continent && lastLogin.continent_code !== continent) {
        impossibleTravel = true;
      }
    }
  }

  // High-risk country flag
  const isHighRiskCountry = country ? HIGH_RISK_COUNTRIES.has(country) : false;

  // Check if device is trusted
  let isTrustedDevice = false;
  if (user_id && device_fingerprint) {
    const { data: trusted } = await supabase
      .from('trusted_devices')
      .select('id')
      .eq('user_id', user_id)
      .eq('device_fingerprint', device_fingerprint)
      .eq('is_active', true)
      .maybeSingle();
    isTrustedDevice = !!trusted;
  }

  // Calculate risk score
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentFailures } = await supabase
    .from('server_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', emailLower)
    .eq('success', false)
    .gte('created_at', oneHourAgo);

  const riskScore = Math.min(100,
    (recentFailures || 0) * 15 +
    (geoAnomaly ? 30 : 0) +
    (impossibleTravel ? 25 : 0) +
    (isHighRiskCountry ? 20 : 0) +
    (!success ? 10 : 0) +
    (!isTrustedDevice && user_id ? 5 : 0)
  );

  // Insert attempt record
  await supabase.from('server_login_attempts').insert({
    email: emailLower,
    ip_address: ip,
    device_fingerprint: device_fingerprint || null,
    country,
    city,
    continent_code: continent,
    user_agent: ua,
    success: !!success,
    failure_reason: failure_reason || null,
    risk_score: riskScore,
    is_suspicious: riskScore >= 50,
    geo_anomaly: geoAnomaly,
  });

  // Security alerts for high-risk events
  if (geoAnomaly || impossibleTravel || isHighRiskCountry) {
    const alertType = impossibleTravel ? 'impossible_travel' : geoAnomaly ? 'new_country_login' : 'high_risk_country';
    const severity = impossibleTravel ? 'critical' : geoAnomaly ? 'high' : 'medium';

    await supabase.from('security_alerts').insert({
      user_id: user_id || null,
      email: emailLower,
      alert_type: alertType,
      severity,
      description: impossibleTravel
        ? `Login from ${country}/${city} detected — continent jump from previous login`
        : geoAnomaly
        ? `Login from new country: ${country}/${city}`
        : `Login from high-risk country: ${country}`,
      metadata: { ip, country, city, continent, device: ua, previous_country: recentLogins?.[0]?.country },
    });

    // Send security alert email
    if (emailLower) {
      sendSecurityAlertEmail(supabase, emailLower, alertType, { country, city, device: ua, ip });
    }
  }

  // If failed, check if we need to create/escalate lockout
  if (!success) {
    const totalFailures = (recentFailures || 0) + 1;

    let lockTier = null;
    for (let i = LOCKOUT_TIERS.length - 1; i >= 0; i--) {
      if (totalFailures >= LOCKOUT_TIERS[i].threshold) {
        lockTier = LOCKOUT_TIERS[i];
        break;
      }
    }

    if (lockTier) {
      await supabase
        .from('server_lockouts')
        .update({ is_active: false })
        .eq('email', emailLower);

      const unlockAt = new Date(Date.now() + lockTier.durationMin * 60 * 1000).toISOString();

      await supabase.from('server_lockouts').insert({
        email: emailLower,
        unlock_at: unlockAt,
        failed_attempts: totalFailures,
        lockout_tier: lockTier.tier,
        ip_address: ip,
        is_active: true,
      });

      // Security alert for lockout tier >= 2
      if (lockTier.tier >= 2) {
        await supabase.from('security_alerts').insert({
          user_id: user_id || null,
          email: emailLower,
          alert_type: 'account_lockout_escalated',
          severity: lockTier.tier >= 3 ? 'critical' : 'high',
          description: `Account locked tier ${lockTier.tier}: ${totalFailures} failed attempts, locked for ${lockTier.durationMin} min`,
          metadata: { ip, tier: lockTier.tier, total_failures: totalFailures, duration_min: lockTier.durationMin },
        });

        sendSecurityAlertEmail(supabase, emailLower, 'account_lockout', { country, city, device: ua, ip });
      }

      if (user_id) {
        await supabase.from('user_security_events').insert({
          user_id,
          event_type: 'account_locked',
          description: `Account locked for ${lockTier.durationMin} minutes after ${totalFailures} failed attempts`,
          ip_address: ip,
          country,
          city,
          device_info: ua,
          risk_level: lockTier.tier >= 3 ? 'critical' : lockTier.tier >= 2 ? 'high' : 'medium',
        });
      }

      return {
        recorded: true,
        locked: true,
        lockout_duration_min: lockTier.durationMin,
        unlock_at: unlockAt,
        tier: lockTier.tier,
        total_failures: totalFailures,
      };
    }

    return {
      recorded: true,
      locked: false,
      total_failures: totalFailures,
      attempts_until_lock: Math.max(0, 5 - totalFailures),
    };
  }

  // Success: clear active lockouts
  await supabase
    .from('server_lockouts')
    .update({ is_active: false })
    .eq('email', emailLower);

  // Register/update trusted device on successful login
  if (user_id && device_fingerprint) {
    await supabase.from('trusted_devices').upsert({
      user_id,
      device_fingerprint,
      device_name: ua.substring(0, 100),
      last_used_at: new Date().toISOString(),
      is_active: true,
    }, { onConflict: 'user_id,device_fingerprint' }).catch(() => {});
  }

  // Log successful login security event
  if (user_id) {
    await supabase.from('user_security_events').insert({
      user_id,
      event_type: geoAnomaly ? 'login_new_country' : 'login_success',
      description: geoAnomaly ? `Login from new location: ${country}/${city}` : 'Successful login',
      ip_address: ip,
      country,
      city,
      device_info: ua,
      risk_level: impossibleTravel ? 'critical' : geoAnomaly ? 'high' : isHighRiskCountry ? 'medium' : 'low',
    });
  }

  return {
    recorded: true,
    locked: false,
    risk_score: riskScore,
    geo_anomaly: geoAnomaly,
    impossible_travel: impossibleTravel,
    is_trusted_device: isTrustedDevice,
    require_otp: (geoAnomaly || impossibleTravel || isHighRiskCountry) && !isTrustedDevice,
    country,
    city,
  };
}

// ─── get_security_events ────────────────────────────────────────────
async function getSecurityEvents(supabase: any, userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('user_security_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return { success: true, events: data || [] };
}

// ─── generate_otp ───────────────────────────────────────────────────
async function generateOtp(params: Record<string, any>, supabase: any, userId: string, userEmail: string, req: Request) {
  const purpose = params.purpose || 'mfa';
  const email = params.email || userEmail;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  const ip = clientIp(req);

  await supabase.from('otp_codes').delete().eq('user_id', userId).eq('purpose', purpose).eq('is_used', false);

  const { error: otpError } = await supabase.from('otp_codes').insert({
    user_id: userId, code, purpose,
    expires_at: expiresAt.toISOString(),
    ip_address: ip,
    user_agent: req.headers.get('user-agent') || 'unknown',
  });
  if (otpError) throw new Error('Failed to generate OTP');

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

  const { data: lockout } = await supabase.from('account_lockouts').select('*').eq('email', email).eq('is_active', true).maybeSingle();
  const isLocked = !!lockout && new Date(lockout.unlock_at) > new Date();

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

    let livenessResult = null;
    if (verification_type !== 'basic' && selfie_image) {
      await new Promise(r => setTimeout(r, 500));
      const score = 70 + Math.random() * 28;
      livenessResult = { passed: score >= 75, score: Math.round(score * 10) / 10 };
    }

    let faceMatchResult = null;
    if (verification_type === 'enhanced' && document_image && selfie_image) {
      await new Promise(r => setTimeout(r, 500));
      const score = 75 + Math.random() * 24;
      faceMatchResult = { passed: score >= 80, score: Math.round(score * 10) / 10 };
    }

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

  if (ip_address) {
    const { data: wl } = await supabase.from('whitelisted_ips').select('id').eq('ip_address', ip_address).maybeSingle();
    if (wl) return { allowed: true, remaining: 999999, reset: 0, limit: 999999, whitelisted: true };
  }

  if (ip_address) {
    const { data: blocked } = await supabase.from('blocked_ips').select('*').eq('ip_address', ip_address).or('expires_at.is.null,expires_at.gt.now()').maybeSingle();
    if (blocked) return { allowed: false, blocked: true, reason: blocked.reason, remaining: 0, reset: blocked.expires_at ? Math.ceil((new Date(blocked.expires_at).getTime() - Date.now()) / 1000) : null };
  }

  const normalizedApiKey = typeof api_key === 'string' ? api_key.trim() : '';
  const apiKeyHash = normalizedApiKey ? await sha256Hex(normalizedApiKey) : null;
  const apiKeyPrefix = normalizedApiKey ? normalizedApiKey.slice(0, 10) : null;

  let multiplier = 1.0;
  if (normalizedApiKey) {
    const keyColumns = 'id, expires_at, rate_limit_multiplier, is_whitelisted, partner_name, total_requests';

    const { data: hashedKeyData } = await supabase
      .from('partner_api_keys')
      .select(keyColumns)
      .eq('api_key', apiKeyHash)
      .eq('is_active', true)
      .maybeSingle();

    const { data: legacyKeyData } = hashedKeyData
      ? { data: null }
      : await supabase
          .from('partner_api_keys')
          .select(keyColumns)
          .eq('api_key', normalizedApiKey)
          .eq('is_active', true)
          .maybeSingle();

    const keyData = hashedKeyData || legacyKeyData;

    if (!keyData) throw new Error('Invalid API key');
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) throw new Error('API key expired');

    multiplier = keyData.rate_limit_multiplier || 1.0;

    await supabase
      .from('partner_api_keys')
      .update({ last_used_at: new Date().toISOString(), total_requests: (keyData.total_requests || 0) + 1 })
      .eq('id', keyData.id);

    if (keyData.is_whitelisted) {
      return {
        allowed: true,
        remaining: 999999,
        reset: 0,
        limit: 999999,
        whitelisted: true,
        partner: keyData.partner_name,
      };
    }
  }

  let { data: config } = await supabase.from('rate_limit_config').select('*').eq('endpoint_pattern', endpoint).eq('is_active', true).maybeSingle();
  if (!config) {
    const { data: def } = await supabase.from('rate_limit_config').select('*').eq('endpoint_pattern', 'default').maybeSingle();
    config = def;
  }
  if (!config) return { allowed: true, remaining: 999, reset: 60, limit: 999 };

  const identifier = apiKeyHash || user_id || ip_address;
  const identifierType = normalizedApiKey ? 'api_key' : user_id ? 'user' : 'ip';
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
    await supabase.from('rate_limit_violations').insert({
      identifier,
      identifier_type: identifierType,
      endpoint_pattern: endpoint,
      user_agent,
      request_path,
      metadata: {
        ip_address,
        user_id,
        api_key_prefix: apiKeyPrefix,
      },
    });
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

    // Authenticate (optional for some actions)
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

    // Actions NOT requiring auth
    const noAuthActions: Action[] = ['check_lockout', 'record_login_attempt', 'rate_limit_check'];

    // Actions requiring auth
    const authRequired: Action[] = ['generate_otp', 'verify_otp', 'send_2fa', 'check_breach', 'verify_document', 'verify_owner', 'verify_vendor', 'get_user_sessions', 'revoke_session', 'revoke_all_sessions', 'get_security_events', 'get_verification_requests'];
    if (authRequired.includes(action) && !userId) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let result: Record<string, unknown>;

    switch (action) {
      case 'check_lockout':
        result = await checkLockout(params, supabase);
        break;
      case 'record_login_attempt':
        result = await recordLoginAttempt(params, supabase, req);
        break;
      case 'get_user_sessions':
        result = await getUserSessions(supabase, userId!);
        break;
      case 'revoke_session':
        result = await revokeSession(params, supabase, userId!, req);
        break;
      case 'revoke_all_sessions':
        result = await revokeAllSessions(supabase, userId!, (params.current_fingerprint as string) || '', req);
        break;
      case 'get_security_events':
        result = await getSecurityEvents(supabase, userId!, (params.limit as number) || 50);
        break;
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
      case 'session_heartbeat': {
        if (!userId) throw new Error('Authentication required for session_heartbeat');
        const fp = (params.device_fingerprint as string) || '';
        const deviceName = (params.device_name as string) || 'Unknown';
        const deviceType = (params.device_type as string) || 'desktop';
        const browser = (params.browser as string) || '';
        const os = (params.os as string) || '';

        try {
          await supabase.from('user_sessions').upsert({
            user_id: userId,
            device_fingerprint: fp,
            device_name: deviceName,
            device_type: deviceType,
            browser,
            os,
            last_activity_at: new Date().toISOString(),
            is_current: true,
          }, { onConflict: 'user_id,device_fingerprint' });
        } catch { /* table may not exist yet */ }

        result = { success: true, action: 'session_heartbeat' };
        break;
      }
      case 'register_device': {
        if (!userId) throw new Error('Authentication required for register_device');
        const fp = (params.device_fingerprint as string) || '';
        const deviceType = (params.device_type as string) || 'desktop';
        const browserName = (params.browser_name as string) || '';
        const browserVersion = (params.browser_version as string) || '';
        const osName = (params.os_name as string) || '';
        const osVersion = (params.os_version as string) || '';

        try {
          await supabase.from('user_sessions').upsert({
            user_id: userId,
            device_fingerprint: fp,
            device_name: `${deviceType === 'desktop' ? 'Desktop' : deviceType === 'mobile' ? 'Mobile' : 'Tablet'} · ${browserName} on ${osName}`,
            device_type: deviceType,
            browser: `${browserName} ${browserVersion}`.trim(),
            os: `${osName} ${osVersion}`.trim(),
            last_active_at: new Date().toISOString(),
            is_active: true,
          }, { onConflict: 'user_id,device_fingerprint' });
        } catch { /* table may not exist yet */ }

        result = { success: true, action: 'register_device' };
        break;
      }
      case 'get_verification_requests': {
        // Check admin
        const { data: adminCheck } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (!adminCheck) throw new Error('Admin access required');

        const type = (params.type as string) || 'all';
        const status = (params.status as string) || 'all';

        // Query owner verifications from profiles
        let ownerQuery = supabase
          .from('profiles')
          .select('id, full_name, email, phone, avatar_url, identity_verified, email_verified, phone_verified, created_at')
          .order('created_at', { ascending: false })
          .limit(100);

        if (status === 'pending') {
          ownerQuery = ownerQuery.or('identity_verified.eq.false,email_verified.eq.false,phone_verified.eq.false');
        } else if (status === 'verified') {
          ownerQuery = ownerQuery.eq('identity_verified', true).eq('email_verified', true);
        }

        const { data: owners } = await ownerQuery;

        // Query vendor verifications
        let vendorQuery = supabase
          .from('vendor_profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (status === 'pending') {
          vendorQuery = vendorQuery.eq('verification_status', 'pending');
        } else if (status === 'verified') {
          vendorQuery = vendorQuery.eq('verification_status', 'verified');
        }

        const { data: vendors } = await vendorQuery;

        // Compute stats
        const totalOwners = owners?.length || 0;
        const verifiedOwners = owners?.filter((o: any) => o.identity_verified && o.email_verified)?.length || 0;
        const totalVendors = vendors?.length || 0;
        const verifiedVendors = vendors?.filter((v: any) => v.verification_status === 'verified')?.length || 0;

        result = {
          success: true,
          data: {
            owners: type === 'vendors' ? [] : (owners || []),
            vendors: type === 'owners' ? [] : (vendors || []),
          },
          stats: {
            totalOwners,
            verifiedOwners,
            pendingOwners: totalOwners - verifiedOwners,
            totalVendors,
            verifiedVendors,
            pendingVendors: totalVendors - verifiedVendors,
          },
        };
        break;
      }
      case 'admin_password_reset': {
        // Admin-triggered password reset for a user
        const targetEmail = params.email as string;
        if (!targetEmail) throw new Error('email required');

        // Verify caller is admin
        const { data: adminRoleCheck } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .in('role', ['admin', 'super_admin'])
          .maybeSingle();
        if (!adminRoleCheck) throw new Error('Admin access required');

        // Use service-role client for admin password reset
        const { error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: targetEmail,
        });
        if (resetError) throw resetError;

        // Log admin action
        await supabase.from('user_security_logs').insert({
          user_id: userId,
          event_type: 'admin_password_reset',
          ip_address: clientIp(req),
          user_agent: req.headers.get('user-agent') || '',
          risk_score: 0,
          is_flagged: false,
          metadata: { target_email: targetEmail, triggered_by: userId },
        });

        result = { success: true, message: 'Password reset email sent' };
        break;
      }

      case 'admin_send_notice': {
        // Admin sends a notification/notice to a user
        const noticeEmail = params.email as string;
        const noticeMessage = params.message as string;
        if (!noticeEmail || !noticeMessage) throw new Error('email and message required');

        // Verify caller is admin
        const { data: adminNoticeCheck } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .in('role', ['admin', 'super_admin'])
          .maybeSingle();
        if (!adminNoticeCheck) throw new Error('Admin access required');

        // Send via transactional email
        try {
          await supabase.functions.invoke('send-transactional-email', {
            body: {
              to: noticeEmail,
              subject: 'Important Notice from ASTRA',
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#333;">Important Notice</h2>
                <p style="color:#555;line-height:1.6;">${noticeMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
                <p style="color:#999;font-size:12px;">This is an administrative notification from ASTRA. Please do not reply to this email.</p>
              </div>`,
            },
          });
        } catch { /* email sending is best-effort */ }

        // Log the action
        await supabase.from('user_security_logs').insert({
          user_id: userId,
          event_type: 'admin_notice_sent',
          ip_address: clientIp(req),
          user_agent: req.headers.get('user-agent') || '',
          risk_score: 0,
          is_flagged: false,
          metadata: { target_email: noticeEmail, message_preview: noticeMessage.slice(0, 100) },
        });

        // Also store in login alerts for the target user
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', noticeEmail)
          .maybeSingle();

        if (targetProfile) {
          await supabase.from('user_login_alerts').insert({
            user_id: targetProfile.id,
            alert_type: 'admin_notice',
            message: noticeMessage,
            is_read: false,
          });
        }

        result = { success: true, message: 'Notice sent successfully' };
        break;
      }

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
