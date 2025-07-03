
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, propertyId, conversationHistory } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!propertyId) {
      return new Response(JSON.stringify({ message: "I'm sorry, I need a property to negotiate for. Please start negotiation from a property page." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('title, price, currency, description')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error("Property fetch error:", propertyError);
      return new Response(JSON.stringify({ message: "I couldn't find details for this property. Please try again." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    const systemPrompt = `You are an AI assistant named 'Astra Negotiator' for a real estate platform. Your role is to negotiate rental terms on behalf of the property owner. You are negotiating for the property: "${property.title}", which is listed at ${property.price} ${property.currency} per month.

Your negotiation parameters are:
- **Price:** You can agree to a discount of up to 5% off the listing price. Do not go lower.
- **Deposit:** The security deposit must be at least one month's rent. You can negotiate on amounts above that.
- **Lease Duration:** The preferred lease term is 12 months or longer. You can offer a small extra discount for leases of 24 months or more.
- **Other terms:** You can discuss other terms like pets (check property description for policy), move-in date, etc. Be flexible but protect the owner's interests.

Your personality: Be professional, polite, firm, and fair. Your goal is to reach a mutually agreeable deal. Start by acknowledging the user's message and then present your response or counter-offer.

The conversation history so far is:
${conversationHistory.map((msg: { role: string, content: string }) => `${msg.role}: ${msg.content}`).join('\n')}

The user's latest message is: "${message}". Analyze their request and provide a response.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text();
      console.error("OpenAI API error:", errorBody);
      throw new Error(`OpenAI API request failed with status ${openAIResponse.status}`);
    }

    const completion = await openAIResponse.json();
    const responseMessage = completion.choices[0].message.content.trim();

    return new Response(JSON.stringify({ message: responseMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rental-negotiator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
