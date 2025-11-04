import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const SearchRequestSchema = z.object({
  imageUrl: z.string()
    .min(1, 'Image URL is required')
    .refine((url) => {
      // Validate data URL format
      if (url.startsWith('data:image/')) {
        const parts = url.split(',');
        if (parts.length !== 2) return false;
        
        // Check base64 size (max 5MB encoded)
        const base64Data = parts[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        return sizeInBytes <= maxSize;
      }
      
      // Validate HTTP(S) URL format
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      }
      
      return false;
    }, 'Invalid image URL format or size exceeds 5MB'),
  weights: z.object({
    propertyType: z.number().min(0).max(100).optional(),
    style: z.number().min(0).max(100).optional(),
    architecture: z.number().min(0).max(100).optional(),
    bedrooms: z.number().min(0).max(100).optional(),
    amenities: z.number().min(0).max(100).optional(),
  }).optional()
});

// Rate limiting: Simple in-memory store (use Redis/Supabase in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const limit = rateLimitStore.get(identifier);
  
  // Allow 5 requests per minute
  const MAX_REQUESTS = 5;
  const WINDOW_MS = 60 * 1000;
  
  if (!limit || now > limit.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  
  if (limit.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((limit.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  limit.count++;
  return { allowed: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check (use IP or user agent as identifier)
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const rateLimitId = `${clientIp}-${userAgent}`;
    
    const rateLimit = checkRateLimit(rateLimitId);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimit.retryAfter 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.retryAfter || 60)
          }, 
          status: 429 
        }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validationResult = SearchRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          details: validationResult.error.errors.map(e => e.message).join(', ')
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { imageUrl, weights = { propertyType: 30, style: 20, architecture: 15, bedrooms: 10, amenities: 25 } } = validationResult.data;
    
    // Additional content type validation for data URLs
    if (imageUrl.startsWith('data:')) {
      const mimeType = imageUrl.split(';')[0].split(':')[1];
      const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      
      if (!validMimeTypes.includes(mimeType)) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid image format. Supported formats: JPEG, PNG, WebP, GIF' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Step 1: Analyze the uploaded image using Google Gemini Vision
    console.log('Analyzing image with Lovable AI...');
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this property image and extract the following details in JSON format:
{
  "propertyType": "house|apartment|villa|condo|townhouse|land",
  "style": "modern|traditional|colonial|minimalist|industrial|contemporary|rustic",
  "architecture": "single-story|multi-story|high-rise|bungalow|duplex",
  "bedrooms": number (estimate),
  "amenities": ["pool", "garden", "garage", "balcony", "terrace"],
  "visualFeatures": {
    "dominantColors": ["color1", "color2"],
    "buildingMaterial": "brick|wood|concrete|glass",
    "roofType": "flat|pitched|gabled",
    "surroundings": "urban|suburban|rural|beachfront"
  },
  "condition": "new|good|fair|needs-renovation",
  "size": "small|medium|large|very-large"
}

Be specific and accurate. If uncertain about a field, make your best educated guess based on visible features.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!analysisResponse.ok) {
      if (analysisResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (analysisResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const content = analysisData.choices?.[0]?.message?.content || '';
    
    // Extract JSON from the response
    let imageFeatures: any;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        imageFeatures = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      // Fallback: create basic features from text analysis
      imageFeatures = {
        propertyType: 'house',
        style: 'modern',
        architecture: 'multi-story',
        bedrooms: 3,
        amenities: [],
        visualFeatures: {
          dominantColors: [],
          buildingMaterial: 'unknown',
          roofType: 'unknown',
          surroundings: 'unknown'
        },
        condition: 'good',
        size: 'medium'
      };
    }

    console.log('Image features extracted:', imageFeatures);

    // Step 2: Query Supabase for published properties
    // Using anon key to respect RLS policies (published properties are public)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: properties, error: dbError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'published')
      .limit(100);

    if (dbError) throw dbError;

    // Step 3: Calculate similarity scores
    const scoredProperties = properties.map(property => {
      let totalScore = 0;
      const breakdown: any = {};

      // Property Type Match (0-100)
      const propertyTypeScore = property.property_type?.toLowerCase() === imageFeatures.propertyType?.toLowerCase() ? 100 : 0;
      breakdown.propertyType = propertyTypeScore;
      totalScore += (propertyTypeScore * weights.propertyType) / 100;

      // Style Match (fuzzy matching)
      const styleMatch = property.description?.toLowerCase().includes(imageFeatures.style?.toLowerCase() || '') ? 70 : 30;
      breakdown.style = styleMatch;
      totalScore += (styleMatch * weights.style) / 100;

      // Architecture/Size Match
      const bedroomDiff = Math.abs((property.bedrooms || 0) - (imageFeatures.bedrooms || 0));
      const bedroomScore = Math.max(0, 100 - (bedroomDiff * 25));
      breakdown.bedrooms = bedroomScore;
      totalScore += (bedroomScore * weights.bedrooms) / 100;

      // Amenities Match
      let amenitiesScore = 0;
      const propertyAmenities = [
        ...(property.features || []),
        property.has_pool ? 'pool' : null,
        property.has_garage ? 'garage' : null,
      ].filter(Boolean);

      const matchingAmenities = (imageFeatures.amenities || []).filter((a: string) =>
        propertyAmenities.some((pa: any) => pa?.toLowerCase().includes(a.toLowerCase()))
      );
      amenitiesScore = propertyAmenities.length > 0 
        ? (matchingAmenities.length / Math.max(imageFeatures.amenities?.length || 1, 1)) * 100 
        : 50;
      breakdown.amenities = amenitiesScore;
      totalScore += (amenitiesScore * weights.amenities) / 100;

      // Architecture score (multi-story vs single)
      const archScore = property.listing_type?.toLowerCase().includes('house') ? 60 : 50;
      breakdown.architecture = archScore;
      totalScore += (archScore * weights.architecture) / 100;

      return {
        ...property,
        similarityScore: Math.round(totalScore),
        similarityBreakdown: breakdown
      };
    });

    // Step 4: Sort by similarity and return top matches
    const sortedProperties = scoredProperties
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .filter(p => p.similarityScore >= 30) // Only show reasonable matches
      .slice(0, 20);

    return new Response(
      JSON.stringify({
        success: true,
        imageFeatures,
        properties: sortedProperties,
        totalMatches: sortedProperties.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-by-image:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process image search',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
