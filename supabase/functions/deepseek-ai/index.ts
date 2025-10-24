import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const deepseekRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  type: z.enum(['chat', 'diagnostics', 'code-analysis']).optional().default('chat'),
  model: z.string().max(100).optional().default('deepseek-coder'),
  temperature: z.number().min(0).max(2).optional().default(0.3)
});

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

    const rawData = await req.json();
    const { prompt, type, model, temperature } = deepseekRequestSchema.parse(rawData);

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
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ 
        error: 'Validation failed',
        details: error.errors,
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});