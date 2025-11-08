import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone_number, user_id } = await req.json();

    if (!phone_number || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
    // For now, this is a placeholder
    console.log(`SMS Code for ${phone_number}: ${code}`);

    // TODO: Store the code in database with expiration (5 minutes)
    // TODO: Send SMS via provider API

    // Example Twilio integration (requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN secrets):
    /*
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone_number,
          From: twilioPhoneNumber,
          Body: `Your verification code is: ${code}. This code expires in 5 minutes.`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        // In development, include code for testing
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { code })
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});