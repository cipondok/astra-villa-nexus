import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// In-memory cache (persists across warm invocations)
let cachedRates: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();

    // Return cached rates if still fresh
    if (cachedRates && (now - cachedRates.fetchedAt) < CACHE_TTL_MS) {
      return new Response(JSON.stringify({
        rates: cachedRates.rates,
        cached: true,
        fetchedAt: new Date(cachedRates.fetchedAt).toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Frankfurter API — free, no key needed, ECB data
    // Base IDR is not supported directly, so we fetch USD-based rates and derive IDR rates
    const response = await fetch(
      'https://api.frankfurter.dev/v1/latest?base=USD&symbols=IDR,SGD,AUD'
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Frankfurter API error:', response.status, errText);
      throw new Error(`Frankfurter API error: ${response.status}`);
    }

    const data = await response.json();
    // data.rates = { IDR: 16200, SGD: 1.34, AUD: 1.55 }

    const usdToIdr = data.rates.IDR || 16200;
    const usdToSgd = data.rates.SGD || 1.34;
    const usdToAud = data.rates.AUD || 1.55;

    // We need rates as "1 IDR = X target_currency"
    const rates = {
      IDR: 1,
      USD: 1 / usdToIdr,                         // 1 IDR → USD
      SGD: usdToSgd / usdToIdr,                  // 1 IDR → SGD
      AUD: usdToAud / usdToIdr,                  // 1 IDR → AUD
    };

    cachedRates = { rates, fetchedAt: now };

    return new Response(JSON.stringify({
      rates,
      cached: false,
      fetchedAt: new Date(now).toISOString(),
      source: 'Frankfurter (ECB)',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Exchange rate fetch error:', error);

    // If we have stale cache, return it with a warning
    if (cachedRates) {
      return new Response(JSON.stringify({
        rates: cachedRates.rates,
        cached: true,
        stale: true,
        fetchedAt: new Date(cachedRates.fetchedAt).toISOString(),
        warning: 'Using stale cached rates due to API error',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback to hardcoded defaults
    return new Response(JSON.stringify({
      rates: { IDR: 1, USD: 1 / 16200, SGD: 1 / 11900, AUD: 1 / 10500 },
      cached: false,
      fallback: true,
      warning: 'Using fallback rates — API unavailable',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
