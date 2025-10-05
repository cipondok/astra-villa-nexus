import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyCaptchaRequest {
  token: string;
  action: string;
}

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action } = await req.json() as VerifyCaptchaRequest;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get secret key from environment
    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Captcha verification not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the token with Google reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const verifyData = await verifyResponse.json() as RecaptchaResponse;

    // Check if verification was successful
    if (!verifyData.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Captcha verification failed',
          errorCodes: verifyData['error-codes']
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check score (reCAPTCHA v3 returns a score from 0.0 to 1.0)
    // 0.0 is very likely a bot, 1.0 is very likely a human
    const minimumScore = 0.5;
    if (verifyData.score < minimumScore) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Captcha score too low',
          score: verifyData.score 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify action matches
    if (action && verifyData.action !== action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Action mismatch' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // All checks passed
    return new Response(
      JSON.stringify({ 
        success: true, 
        score: verifyData.score,
        action: verifyData.action 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error verifying captcha:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
