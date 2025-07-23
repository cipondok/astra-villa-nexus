import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const { prompt, type = 'chat', model = 'deepseek-coder', temperature = 0.3 } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: type === 'diagnostics' 
              ? 'You are an expert system diagnostic assistant. Analyze the provided system data and provide actionable insights, potential issues, and optimization recommendations. Focus on practical solutions and prioritize critical issues.'
              : type === 'code-analysis'
              ? 'You are a senior software architect and code reviewer. Analyze the provided code/project structure and identify potential improvements, security issues, performance optimizations, and architectural recommendations.'
              : 'You are a helpful AI assistant specialized in technical analysis and problem-solving.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: 2000,
        top_p: 0.8,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0].message.content;

    // Log for debugging
    console.log('DeepSeek analysis completed:', {
      type,
      model,
      promptLength: prompt.length,
      responseLength: analysisResult.length
    });

    return new Response(JSON.stringify({ 
      analysis: analysisResult,
      model: model,
      type: type,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in deepseek-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});