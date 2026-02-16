import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const INDONESIAN_KEYWORDS: Record<string, string[]> = {
  general_id: ['dijual', 'disewa', 'murah', 'mewah', 'terbaik', 'strategis', 'investasi', 'properti', 'harga', 'lokasi'],
  general_en: ['luxury', 'premium', 'exclusive', 'investment', 'prime', 'beachfront', 'private pool', 'modern', 'furnished'],
  villa: ['villa', 'villa mewah', 'villa murah', 'villa dijual', 'villa disewa', 'villa private pool', 'villa dekat pantai'],
  rumah: ['rumah', 'rumah dijual', 'rumah murah', 'rumah mewah', 'rumah minimalis', 'rumah strategis', 'rumah baru'],
  apartemen: ['apartemen', 'apartment', 'apartemen dijual', 'apartemen murah', 'apartemen mewah', 'apartemen furnished'],
  tanah: ['tanah', 'tanah dijual', 'kavling', 'tanah murah', 'tanah strategis', 'tanah investasi'],
  ruko: ['ruko', 'ruko dijual', 'ruko strategis', 'ruko murah', 'ruko baru'],
  locations: ['bali', 'jakarta', 'bandung', 'surabaya', 'lombok', 'yogyakarta', 'semarang', 'medan', 'makassar', 'malang'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'analyze-property':
        return await analyzeProperty(supabase, lovableApiKey, body);
      case 'analyze-batch':
        return await analyzeBatch(supabase, lovableApiKey, body);
      case 'get-keyword-suggestions':
        return await getKeywordSuggestions(supabase, lovableApiKey, body);
      case 'get-trending-keywords':
        return await getTrendingKeywords(supabase, body);
      case 'update-custom-seo':
        return await updateCustomSeo(supabase, body);
      case 'auto-optimize':
        return await autoOptimizeWeak(supabase, lovableApiKey, body);
      case 'apply-seo':
        return await applySeoToProperty(supabase, body);
      case 'competitor-analysis':
        return await competitorAnalysis(supabase, lovableApiKey, body);
      case 'content-optimize':
        return await contentOptimize(supabase, lovableApiKey, body);
      case 'generate-serp-preview':
        return await generateSerpPreview(supabase, lovableApiKey, body);
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('SEO analyzer error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeProperty(supabase: any, apiKey: string | undefined, body: any) {
  const { propertyId } = body;

  const { data: property, error } = await supabase
    .from('properties')
    .select('id, title, description, location, property_type, listing_type, price, state, city, property_features')
    .eq('id', propertyId)
    .single();

  if (error || !property) return jsonResponse({ error: 'Property not found' }, 404);

  const { data: trendKeywords } = await supabase
    .from('seo_trend_data')
    .select('keyword, search_volume, trend_score, competition_level')
    .order('trend_score', { ascending: false })
    .limit(30);

  let aiResult: any = null;
  if (apiKey) {
    aiResult = await generateAISeoAnalysis(apiKey, property, trendKeywords || []);
  }

  const analysis = aiResult || generateRuleBasedAnalysis(property, trendKeywords || []);

  const { data: saved, error: saveErr } = await supabase
    .from('property_seo_analysis')
    .upsert({
      property_id: propertyId,
      seo_score: analysis.seo_score,
      seo_rating: getSeoRating(analysis.seo_score),
      seo_title: analysis.seo_title,
      seo_description: analysis.seo_description,
      seo_keywords: analysis.seo_keywords,
      seo_hashtags: analysis.seo_hashtags,
      title_score: analysis.title_score,
      description_score: analysis.description_score,
      keyword_score: analysis.keyword_score,
      hashtag_score: analysis.hashtag_score,
      location_score: analysis.location_score,
      suggested_keywords: analysis.suggested_keywords,
      missing_keywords: analysis.missing_keywords,
      ranking_difficulty: analysis.ranking_difficulty,
      ai_model_used: apiKey ? 'google/gemini-3-flash-preview' : 'rule-based',
      last_analyzed_at: new Date().toISOString(),
    }, { onConflict: 'property_id' })
    .select()
    .single();

  if (saveErr) console.error('Save error:', saveErr);

  return jsonResponse({ success: true, analysis: saved || analysis });
}

async function generateAISeoAnalysis(apiKey: string, property: any, trendKeywords: any[]) {
  const trendContext = trendKeywords.slice(0, 15).map(k => `${k.keyword} (vol: ${k.search_volume}, comp: ${k.competition_level})`).join('\n');

  const prompt = `Analyze this Indonesian property listing for SEO optimization.

PROPERTY:
Title: ${property.title}
Description: ${property.description || 'No description'}
Location: ${property.location} (State: ${property.state || 'N/A'}, City: ${property.city || 'N/A'})
Type: ${property.property_type || 'N/A'}
Listing: ${property.listing_type}
Price: Rp ${property.price?.toLocaleString('id-ID') || 'N/A'}

TRENDING KEYWORDS IN MARKET:
${trendContext}

Return ONLY valid JSON:
{
  "seo_score": <0-100>,
  "seo_title": "<optimized title max 60 chars including ASTRA Villa>",
  "seo_description": "<optimized meta description max 160 chars>",
  "seo_keywords": ["<5-8 high-value keywords in Bahasa & English>"],
  "seo_hashtags": ["<5-8 relevant hashtags>"],
  "title_score": <0-100>,
  "description_score": <0-100>,
  "keyword_score": <0-100>,
  "hashtag_score": <0-100>,
  "location_score": <0-100>,
  "suggested_keywords": ["<5 keywords to add>"],
  "missing_keywords": ["<keywords the listing should have but doesn't>"],
  "ranking_difficulty": "<low|medium|high>",
  "improvements": ["<3 specific suggestions to improve ranking>"]
}

Focus on Indonesian property market. Include both Bahasa Indonesia and English keywords. Title must include brand "ASTRA Villa".`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are an SEO specialist for Indonesian real estate. Return ONLY valid JSON, no markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error('AI API error:', status);
      if (status === 429) return null; // rate limited
      if (status === 402) return null; // payment required
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (e) {
    console.error('AI analysis error:', e);
    return null;
  }
}

function generateRuleBasedAnalysis(property: any, trendKeywords: any[]) {
  const title = (property.title || '').toLowerCase();
  const desc = (property.description || '').toLowerCase();
  const location = (property.location || '').toLowerCase();
  const type = (property.property_type || '').toLowerCase();
  const state = (property.state || '').toLowerCase();

  let titleScore = 40;
  if (title.length >= 20 && title.length <= 60) titleScore += 20;
  if (title.includes(type) || title.includes('villa') || title.includes('rumah')) titleScore += 15;
  if (location && title.includes(location.split(',')[0]?.trim().toLowerCase())) titleScore += 15;
  if (title.includes('dijual') || title.includes('disewa')) titleScore += 10;

  let descScore = 30;
  if (desc.length >= 100) descScore += 20;
  if (desc.length >= 200) descScore += 15;
  if (desc.includes(type)) descScore += 10;
  if (desc.includes(location.split(',')[0]?.trim().toLowerCase())) descScore += 10;
  const featureWords = ['kamar', 'luas', 'garasi', 'taman', 'kolam', 'pool', 'modern', 'furnished'];
  featureWords.forEach(w => { if (desc.includes(w)) descScore += 3; });
  descScore = Math.min(descScore, 100);

  const typeKeywords = INDONESIAN_KEYWORDS[type] || INDONESIAN_KEYWORDS.general_id;
  const presentKeywords = typeKeywords.filter(k => title.includes(k) || desc.includes(k));
  const missingKeywords = typeKeywords.filter(k => !title.includes(k) && !desc.includes(k));
  const keywordScore = Math.min(100, Math.round((presentKeywords.length / typeKeywords.length) * 100));

  let locationScore = 30;
  if (state) locationScore += 30;
  if (property.city) locationScore += 20;
  if (INDONESIAN_KEYWORDS.locations.some((l: string) => location.includes(l))) locationScore += 20;

  const seoScore = Math.round((titleScore * 0.3 + descScore * 0.25 + keywordScore * 0.25 + locationScore * 0.2));

  const category = property.listing_type === 'sale' ? 'dijual' : 'disewa';
  const locationShort = state || location.split(',')[0]?.trim() || '';

  return {
    seo_score: seoScore,
    seo_title: `${property.title} | ${type.charAt(0).toUpperCase() + type.slice(1)} ${category === 'dijual' ? 'Dijual' : 'Disewa'} di ${locationShort} | ASTRA Villa`.slice(0, 60),
    seo_description: `Temukan ${type} ${category} di ${locationShort} dengan harga Rp ${property.price?.toLocaleString('id-ID') || 'N/A'}. Listing eksklusif di ASTRA Villa. Hubungi kami sekarang!`.slice(0, 160),
    seo_keywords: [
      `${type} ${category} ${locationShort}`.toLowerCase(),
      `${type} ${locationShort}`.toLowerCase(),
      `${category} ${type}`,
      `properti ${locationShort}`.toLowerCase(),
      `investasi ${type} ${locationShort}`.toLowerCase(),
    ].filter(Boolean),
    seo_hashtags: [
      `#${type}${locationShort.replace(/\s/g, '')}`,
      `#${type}${category}`,
      `#astravilla`,
      `#propertiindonesia`,
      `#${type}mewah`,
      `#${locationShort.replace(/\s/g, '').toLowerCase()}property`,
    ].filter(Boolean),
    title_score: Math.min(titleScore, 100),
    description_score: descScore,
    keyword_score: keywordScore,
    hashtag_score: 50,
    location_score: Math.min(locationScore, 100),
    suggested_keywords: trendKeywords
      .filter(k => k.keyword.includes(type) || k.keyword.includes(locationShort.toLowerCase()))
      .slice(0, 5)
      .map(k => k.keyword),
    missing_keywords: missingKeywords.slice(0, 5),
    ranking_difficulty: seoScore > 70 ? 'low' : seoScore > 40 ? 'medium' : 'high',
  };
}

function getSeoRating(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'needs_improvement';
  return 'poor';
}

async function analyzeBatch(supabase: any, apiKey: string | undefined, body: any) {
  const { limit = 50, offset = 0, filter = 'unanalyzed' } = body;

  let query = supabase.from('properties').select('id').order('created_at', { ascending: false });
  
  if (filter === 'unanalyzed') {
    const { data: analyzed } = await supabase.from('property_seo_analysis').select('property_id');
    const analyzedIds = (analyzed || []).map((a: any) => a.property_id);
    if (analyzedIds.length > 0) {
      query = query.not('id', 'in', `(${analyzedIds.join(',')})`);
    }
  } else if (filter === 'weak') {
    const { data: weak } = await supabase
      .from('property_seo_analysis')
      .select('property_id')
      .lt('seo_score', 50);
    const weakIds = (weak || []).map((w: any) => w.property_id);
    if (weakIds.length === 0) return jsonResponse({ success: true, analyzed: 0, message: 'No weak listings found' });
    query = query.in('id', weakIds);
  }

  const { data: properties } = await query.range(offset, offset + limit - 1);
  if (!properties?.length) return jsonResponse({ success: true, analyzed: 0, message: 'No properties to analyze' });

  let analyzed = 0;
  const errors: string[] = [];
  for (const prop of properties) {
    try {
      await analyzeProperty(supabase, apiKey, { propertyId: prop.id });
      analyzed++;
      if (apiKey) await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`Failed to analyze ${prop.id}:`, msg);
      errors.push(prop.id);
    }
  }

  return jsonResponse({ success: true, analyzed, total: properties.length, errors: errors.length > 0 ? errors : undefined });
}

async function getKeywordSuggestions(supabase: any, apiKey: string | undefined, body: any) {
  const { location, propertyType, priceRange, listingType } = body;

  if (apiKey) {
    try {
      const prompt = `Suggest 15 high-ranking SEO keywords for Indonesian property search:
Location: ${location || 'Indonesia'}
Property Type: ${propertyType || 'all'}
Price Range: ${priceRange || 'all'}
Listing Type: ${listingType || 'sale'}

Return JSON: { "keywords": [{ "keyword": "...", "search_volume_estimate": N, "competition": "low|medium|high", "relevance_score": N }] }

Include both Bahasa Indonesia and English keywords. Focus on what Indonesian buyers actually search for.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: 'SEO keyword specialist for Indonesian real estate. Return only valid JSON, no markdown.' },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        const jsonMatch = content?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return jsonResponse({ success: true, ...result });
        }
      }
    } catch (e) {
      console.error('AI keyword suggestion error:', e);
    }
  }

  let query = supabase.from('seo_trend_data').select('*').order('trend_score', { ascending: false }).limit(15);
  if (location) query = query.or(`location_relevance.ilike.%${location}%,location_relevance.is.null`);
  if (propertyType) query = query.or(`property_type_relevance.ilike.%${propertyType}%,property_type_relevance.is.null`);

  const { data } = await query;
  return jsonResponse({
    success: true,
    keywords: (data || []).map((k: any) => ({
      keyword: k.keyword,
      search_volume_estimate: k.search_volume,
      competition: k.competition_level,
      relevance_score: k.trend_score,
    })),
  });
}

async function getTrendingKeywords(supabase: any, body: any) {
  const { category, language, limit = 20 } = body;

  let query = supabase.from('seo_trend_data')
    .select('*')
    .order('trend_score', { ascending: false })
    .limit(limit);

  if (category) query = query.eq('category', category);
  if (language) query = query.eq('language', language);

  const { data, error } = await query;
  if (error) return jsonResponse({ error: error.message }, 500);

  return jsonResponse({ success: true, keywords: data });
}

async function updateCustomSeo(supabase: any, body: any) {
  const { propertyId, customTitle, customDescription, customKeywords, customHashtags } = body;

  const updates: any = {};
  if (customTitle) updates.custom_title = customTitle;
  if (customDescription) updates.custom_description = customDescription;
  if (customKeywords) updates.custom_keywords = customKeywords;
  if (customHashtags) updates.custom_hashtags = customHashtags;

  const { data, error } = await supabase
    .from('property_seo_analysis')
    .update(updates)
    .eq('property_id', propertyId)
    .select()
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ success: true, data });
}

async function autoOptimizeWeak(supabase: any, apiKey: string | undefined, body: any) {
  const { threshold = 50, limit = 10 } = body;

  const { data: weakListings } = await supabase
    .from('property_seo_analysis')
    .select('property_id, seo_score')
    .lt('seo_score', threshold)
    .order('seo_score', { ascending: true })
    .limit(limit);

  if (!weakListings?.length) return jsonResponse({ success: true, optimized: 0, message: 'No weak listings' });

  let optimized = 0;
  for (const listing of weakListings) {
    try {
      await analyzeProperty(supabase, apiKey, { propertyId: listing.property_id });
      optimized++;
      if (apiKey) await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`Failed to optimize ${listing.property_id}:`, e);
    }
  }

  return jsonResponse({ success: true, optimized, total: weakListings.length });
}

// NEW: Apply AI-generated SEO data back to the property listing
async function applySeoToProperty(supabase: any, body: any) {
  const { propertyId } = body;

  // Get the SEO analysis
  const { data: seo, error: seoErr } = await supabase
    .from('property_seo_analysis')
    .select('*')
    .eq('property_id', propertyId)
    .single();

  if (seoErr || !seo) return jsonResponse({ error: 'SEO analysis not found' }, 404);

  // Apply optimized title & description to the property
  const newTitle = seo.custom_title || seo.seo_title;
  const newDescription = seo.custom_description || seo.seo_description;

  const { error: updateErr } = await supabase
    .from('properties')
    .update({
      title: newTitle,
      description: newDescription,
    })
    .eq('id', propertyId);

  if (updateErr) return jsonResponse({ error: updateErr.message }, 500);

  return jsonResponse({ 
    success: true, 
    applied: { title: newTitle, description: newDescription },
    keywords: seo.seo_keywords,
    hashtags: seo.seo_hashtags,
  });
}

// NEW: Competitor keyword analysis for a specific location/type
async function competitorAnalysis(supabase: any, apiKey: string | undefined, body: any) {
  const { location, propertyType, limit: propLimit = 10 } = body;

  // Fetch similar properties in the same area
  let query = supabase.from('properties')
    .select('id, title, description, location, property_type, price, listing_type')
    .order('created_at', { ascending: false })
    .limit(propLimit);

  if (location) query = query.ilike('location', `%${location}%`);
  if (propertyType) query = query.eq('property_type', propertyType);

  const { data: competitors } = await query;
  if (!competitors?.length) return jsonResponse({ success: true, competitors: [], insights: null });

  // Get their SEO scores
  const ids = competitors.map((c: any) => c.id);
  const { data: seoData } = await supabase
    .from('property_seo_analysis')
    .select('*')
    .in('property_id', ids);

  const seoMap: Record<string, any> = {};
  (seoData || []).forEach((s: any) => { seoMap[s.property_id] = s; });

  const competitorList = competitors.map((c: any) => ({
    id: c.id,
    title: c.title,
    location: c.location,
    price: c.price,
    property_type: c.property_type,
    seo_score: seoMap[c.id]?.seo_score || null,
    seo_rating: seoMap[c.id]?.seo_rating || 'unanalyzed',
    keywords: seoMap[c.id]?.seo_keywords || [],
  }));

  // AI-powered insights if available
  let insights: any = null;
  if (apiKey && competitors.length >= 3) {
    try {
      const competitorSummary = competitorList.map((c: any) => 
        `- "${c.title}" (Score: ${c.seo_score || 'N/A'}, Keywords: ${(c.keywords || []).join(', ')})`
      ).join('\n');

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: 'Indonesian real estate SEO analyst. Return ONLY valid JSON, no markdown.' },
            { role: 'user', content: `Analyze these competitor listings in ${location || 'Indonesia'} for ${propertyType || 'property'}:

${competitorSummary}

Return JSON:
{
  "market_saturation": "<low|medium|high>",
  "avg_keyword_density": <number>,
  "top_performing_keywords": ["<5 keywords competitors use well>"],
  "keyword_gaps": ["<5 keywords nobody is targeting yet>"],
  "price_positioning": "<below_market|competitive|premium>",
  "recommendations": ["<3 strategic recommendations to outrank competitors>"],
  "difficulty_score": <0-100>
}` },
          ],
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        const jsonMatch = content?.match(/\{[\s\S]*\}/);
        if (jsonMatch) insights = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Competitor analysis AI error:', e);
    }
  }

  return jsonResponse({ success: true, competitors: competitorList, insights });
}

// NEW: AI content optimization for a specific property
async function contentOptimize(supabase: any, apiKey: string | undefined, body: any) {
  const { propertyId } = body;

  const { data: property } = await supabase
    .from('properties')
    .select('id, title, description, location, property_type, listing_type, price, state, city, property_features')
    .eq('id', propertyId)
    .single();

  if (!property) return jsonResponse({ error: 'Property not found' }, 404);

  if (!apiKey) return jsonResponse({ error: 'AI not available' }, 503);

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are an expert SEO content writer for Indonesian real estate. Return ONLY valid JSON, no markdown.' },
          { role: 'user', content: `Optimize this property listing for maximum SEO ranking in Google Indonesia.

CURRENT:
Title: ${property.title}
Description: ${property.description || 'No description provided'}
Location: ${property.location} (${property.state || ''}, ${property.city || ''})
Type: ${property.property_type || 'property'}
Price: Rp ${property.price?.toLocaleString('id-ID') || 'N/A'}
Features: ${JSON.stringify(property.property_features || {})}

Return JSON:
{
  "optimized_title": "<SEO-optimized title, max 60 chars, include ASTRA Villa brand>",
  "optimized_description": "<Full SEO-optimized description, 200-400 words, rich with keywords, in Bahasa Indonesia with English terms>",
  "meta_title": "<meta title for search engines, max 60 chars>",
  "meta_description": "<meta description, max 160 chars>",
  "focus_keywords": ["<5 primary keywords to target>"],
  "secondary_keywords": ["<5 secondary/long-tail keywords>"],
  "hashtags": ["<8 optimized hashtags for social sharing>"],
  "content_score": <estimated score 0-100 after optimization>,
  "word_count_recommendation": <ideal word count>,
  "readability_tips": ["<3 readability improvements>"],
  "schema_suggestions": ["<2 schema markup types recommended>"]
}` },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return jsonResponse({ error: 'Rate limited, try again later' }, 429);
      if (response.status === 402) return jsonResponse({ error: 'AI credits exhausted' }, 402);
      return jsonResponse({ error: 'AI service error' }, 500);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return jsonResponse({ success: true, propertyId, currentTitle: property.title, ...result });
    }
    return jsonResponse({ error: 'Failed to parse AI response' }, 500);
  } catch (e) {
    console.error('Content optimize error:', e);
    return jsonResponse({ error: 'Content optimization failed' }, 500);
  }
}

// NEW: Generate SERP preview showing how the listing would appear in Google
async function generateSerpPreview(supabase: any, apiKey: string | undefined, body: any) {
  const { propertyId } = body;

  const { data: seo } = await supabase
    .from('property_seo_analysis')
    .select('*')
    .eq('property_id', propertyId)
    .single();

  const { data: property } = await supabase
    .from('properties')
    .select('title, description, location, property_type, price')
    .eq('id', propertyId)
    .single();

  if (!property) return jsonResponse({ error: 'Property not found' }, 404);

  const serpTitle = seo?.custom_title || seo?.seo_title || property.title;
  const serpDescription = seo?.custom_description || seo?.seo_description || (property.description || '').slice(0, 160);
  const serpUrl = `astra-villa-realty.lovable.app/properties/${propertyId}`;

  // Generate both current and optimized previews
  const currentPreview = {
    title: property.title?.slice(0, 60) || 'Untitled',
    description: (property.description || '').slice(0, 160) || 'No description available',
    url: serpUrl,
    type: 'current',
  };

  const optimizedPreview = {
    title: serpTitle?.slice(0, 60),
    description: serpDescription?.slice(0, 160),
    url: serpUrl,
    type: 'optimized',
    keywords: seo?.seo_keywords || [],
    score: seo?.seo_score || 0,
  };

  return jsonResponse({ 
    success: true, 
    current: currentPreview, 
    optimized: optimizedPreview,
    improvements: {
      title_changed: currentPreview.title !== optimizedPreview.title,
      description_changed: currentPreview.description !== optimizedPreview.description,
      seo_score: seo?.seo_score || 0,
    }
  });
}
