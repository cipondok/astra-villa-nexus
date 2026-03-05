import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active properties without recent predictions (or never predicted)
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id')
      .eq('status', 'active')
      .is('predicted_days_to_sell', null)
      .limit(50);

    if (error) throw error;

    // Also get properties with stale predictions (predicted > 7 days ago)
    // We'll use updated_at as proxy since we don't track prediction date
    const { data: staleProps } = await supabase
      .from('properties')
      .select('id')
      .eq('status', 'active')
      .not('predicted_days_to_sell', 'is', null)
      .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(25);

    const allIds = [
      ...(properties || []).map(p => p.id),
      ...(staleProps || []).map(p => p.id),
    ];

    // Deduplicate
    const uniqueIds = [...new Set(allIds)];

    let processed = 0;
    let failed = 0;

    // Call core-engine for each property (with rate limiting)
    for (const propertyId of uniqueIds) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/core-engine`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            mode: 'days_to_sell_prediction',
            property_id: propertyId,
          }),
        });

        if (response.ok) {
          processed++;
        } else {
          failed++;
          console.error(`Failed for ${propertyId}: ${response.status}`);
        }
      } catch (err) {
        failed++;
        console.error(`Error for ${propertyId}:`, err);
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Batch DOM prediction: ${processed} processed, ${failed} failed, ${uniqueIds.length} total`);

    return new Response(JSON.stringify({
      success: true,
      processed,
      failed,
      total: uniqueIds.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('batch-dom-predictor error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
