import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  token: string;
  action: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action }: VerifyRequest = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'No token provided' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'reCAPTCHA not configured on server' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify token with Google reCAPTCHA API
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const verifyData = await verifyResponse.json();

    console.log('reCAPTCHA verification:', {
      success: verifyData.success,
      score: verifyData.score,
      action: verifyData.action,
      expectedAction: action,
    });

    // Check if verification was successful
    if (!verifyData.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'reCAPTCHA verification failed',
          'error-codes': verifyData['error-codes']
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if action matches (only when both provided)
    if (action && verifyData.action && verifyData.action !== action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Action mismatch',
          expected: action,
          received: verifyData.action
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check score (for reCAPTCHA v3, score should be >= 0.5)
    const minScore = 0.5;
    if (verifyData.score < minScore) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Low reCAPTCHA score',
          score: verifyData.score,
          minScore
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        score: verifyData.score,
        action: verifyData.action
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error verifying reCAPTCHA:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
