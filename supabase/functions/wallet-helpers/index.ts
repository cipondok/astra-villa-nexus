
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        },
      )
    }

    const { user_id, wallet_address } = await req.json()

    if (!user_id || !wallet_address) {
      throw new Error('Missing required parameters')
    }

    // Verify user can only query their own data
    if (user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Can only access own wallet data' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        },
      )
    }

    const { data, error } = await supabaseClient
      .from('wallet_connections')
      .select('id')
      .eq('user_id', user_id)
      .eq('wallet_address', wallet_address.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return new Response(
      JSON.stringify({ exists: !!data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
