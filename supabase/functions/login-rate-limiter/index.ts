import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoginAttemptRequest {
  email: string;
  success: boolean;
  ip_address?: string;
  user_agent?: string;
  failure_reason?: string;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, success, ip_address, user_agent, failure_reason, user_id } = await req.json() as LoginAttemptRequest

    // Get client IP if not provided
    const clientIP = ip_address || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = user_agent || req.headers.get('user-agent') || ''

    // Check if IP is rate limited (function already exists in database)
    const { data: isRateLimited, error: rateLimitError } = await supabase
      .rpc('check_ip_rate_limit', { p_ip_address: clientIP })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    }

    // Check if account is locked (function already exists in database)
    const { data: isAccountLocked, error: lockoutError } = await supabase
      .rpc('check_account_lockout', { p_email: email })

    if (lockoutError) {
      console.error('Account lockout check error:', lockoutError)
    }

    // Log the login attempt
    const { error: logError } = await supabase
      .from('login_attempts')
      .insert({
        email,
        success,
        ip_address: clientIP,
        user_agent: userAgent,
        failure_reason,
        user_id,
        blocked_by_rate_limit: isRateLimited || false
      })

    if (logError) {
      console.error('Error logging attempt:', logError)
    }

    // If this was a failed attempt, handle rate limiting and lockouts
    if (!success) {
      // Get recent failed attempts from this IP
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { data: recentFailures, error: failuresError } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('ip_address', clientIP)
        .eq('success', false)
        .gte('attempt_time', oneHourAgo)

      if (failuresError) {
        console.error('Error fetching recent failures:', failuresError)
      }

      const failureCount = recentFailures?.length || 0

      // Create account lockout if too many failures (5+ failures in 1 hour)
      if (failureCount >= 5) {
        const { error: lockoutCreateError } = await supabase
          .rpc('create_account_lockout', {
            p_email: email,
            p_user_id: user_id || null,
            p_ip_address: clientIP,
            p_duration_minutes: 60 // Lock for 1 hour
          })

        if (lockoutCreateError) {
          console.error('Error creating lockout:', lockoutCreateError)
        }

        // Log security event
        if (user_id) {
          const { error: securityLogError } = await supabase
            .rpc('log_security_event', {
              p_user_id: user_id,
              p_event_type: 'account_locked',
              p_ip_address: clientIP,
              p_user_agent: userAgent,
              p_risk_score: 90,
              p_metadata: { reason: 'too_many_failed_attempts', failure_count: failureCount }
            })

          if (securityLogError) {
            console.error('Error logging security event:', securityLogError)
          }
        }
      }

      // Log suspicious activity for repeated failures
      if (failureCount >= 3 && user_id) {
        const { error: securityLogError } = await supabase
          .rpc('log_security_event', {
            p_user_id: user_id,
            p_event_type: 'suspicious_activity',
            p_ip_address: clientIP,
            p_user_agent: userAgent,
            p_risk_score: 70,
            p_metadata: { reason: 'repeated_failed_logins', failure_count: failureCount }
          })

        if (securityLogError) {
          console.error('Error logging security event:', securityLogError)
        }
      }
    } else {
      // Successful login - log security event if user_id is available
      if (user_id) {
        const { error: securityLogError } = await supabase
          .rpc('log_security_event', {
            p_user_id: user_id,
            p_event_type: 'successful_login',
            p_ip_address: clientIP,
            p_user_agent: userAgent,
            p_risk_score: 10,
            p_metadata: { login_success: true }
          })

        if (securityLogError) {
          console.error('Error logging security event:', securityLogError)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        rate_limited: isRateLimited || false,
        account_locked: isAccountLocked || false,
        message: 'Login attempt processed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in login-rate-limiter:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})