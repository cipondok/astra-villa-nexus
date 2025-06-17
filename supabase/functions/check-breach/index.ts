
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    // Simulate HaveIBeenPwned API check
    // In real implementation, you would use the actual API
    const isBreached = Math.random() > 0.8; // 20% chance of breach for demo
    
    const breaches = isBreached ? [
      {
        name: "Adobe",
        date: "2013-10-04",
        description: "Email addresses and passwords compromised"
      }
    ] : [];

    return new Response(
      JSON.stringify({ 
        breached: isBreached, 
        breaches 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to check breach status' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
