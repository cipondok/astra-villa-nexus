import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VirtualStagingRequest {
  imageUrl: string;
  roomType: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining_room' | 'office' | 'outdoor';
  style: 'modern' | 'traditional' | 'minimalist' | 'tropical' | 'luxury' | 'scandinavian' | 'industrial';
  furnitureItems?: string[];
  removeExisting?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { imageUrl, roomType, style, furnitureItems, removeExisting } = await req.json() as VirtualStagingRequest;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Virtual staging request:', { roomType, style, furnitureItems });

    // Build the staging prompt based on room type and style
    const furnitureDescriptions: Record<string, Record<string, string>> = {
      living_room: {
        modern: 'modern sectional sofa, glass coffee table, minimalist TV stand, abstract art, indoor plants',
        traditional: 'classic leather sofa, wooden coffee table, antique armchair, traditional rug, bookshelf',
        minimalist: 'simple white sofa, low coffee table, single statement plant, clean lines, neutral colors',
        tropical: 'rattan furniture, tropical plants, bamboo accents, bright cushions, natural textures',
        luxury: 'velvet sofa, marble coffee table, crystal chandelier, designer lamps, gold accents',
        scandinavian: 'light wood furniture, cozy textiles, simple lines, neutral palette, hygge elements',
        industrial: 'leather sofa, metal coffee table, exposed brick elements, vintage lamps, urban decor',
      },
      bedroom: {
        modern: 'platform bed with upholstered headboard, floating nightstands, contemporary lighting, minimalist decor',
        traditional: 'four-poster bed, ornate nightstands, classic table lamps, decorative pillows',
        minimalist: 'simple low bed frame, single nightstand, clean white bedding, subtle lighting',
        tropical: 'canopy bed with sheer curtains, tropical plants, rattan furniture, natural textures',
        luxury: 'king bed with tufted headboard, elegant nightstands, crystal lamps, silk bedding',
        scandinavian: 'light wood bed frame, cozy knit blankets, simple lamps, warm neutral colors',
        industrial: 'metal bed frame, exposed materials, vintage lighting, urban aesthetic',
      },
      kitchen: {
        modern: 'sleek bar stools, modern pendant lights, minimalist accessories, stainless steel accents',
        traditional: 'wooden stools, classic chandelier, decorative dishes, warm lighting',
        minimalist: 'simple seating, hidden storage, clean countertops, minimal accessories',
        tropical: 'rattan bar stools, tropical fruit bowl, plant accents, natural materials',
        luxury: 'marble countertop accessories, designer lighting, gold hardware, premium appliances',
        scandinavian: 'light wood stools, simple pendant lights, organized storage, clean aesthetic',
        industrial: 'metal stools, exposed bulb lighting, raw materials, vintage accessories',
      },
      bathroom: {
        modern: 'contemporary towel rack, modern mirror, sleek accessories, spa-like elements',
        traditional: 'classic vanity accessories, ornate mirror, decorative towels',
        minimalist: 'clean surfaces, hidden storage, simple accessories, white towels',
        tropical: 'bamboo accessories, tropical plants, natural textures, spa elements',
        luxury: 'marble accessories, designer fixtures, plush towels, elegant lighting',
        scandinavian: 'wood accents, simple storage, neutral colors, functional design',
        industrial: 'metal fixtures, exposed piping style, vintage mirror, raw materials',
      },
      dining_room: {
        modern: 'contemporary dining table, designer chairs, statement lighting, minimal decor',
        traditional: 'wooden dining set, classic chandelier, decorative centerpiece, elegant rug',
        minimalist: 'simple table and chairs, clean lines, subtle lighting, minimal accessories',
        tropical: 'rattan dining chairs, wooden table, tropical centerpiece, natural lighting',
        luxury: 'marble dining table, upholstered chairs, crystal chandelier, fine china display',
        scandinavian: 'light wood dining set, simple pendant light, cozy textiles, functional beauty',
        industrial: 'metal and wood table, mixed seating, vintage lighting, urban aesthetic',
      },
      office: {
        modern: 'ergonomic desk, modern office chair, clean shelving, tech accessories',
        traditional: 'wooden executive desk, leather chair, bookshelf, classic lamp',
        minimalist: 'simple desk, minimal storage, clean workspace, focused lighting',
        tropical: 'rattan desk accessories, plants, natural light, bamboo elements',
        luxury: 'premium desk, designer chair, elegant accessories, sophisticated decor',
        scandinavian: 'light wood desk, comfortable chair, organized storage, natural light',
        industrial: 'metal desk, vintage chair, exposed shelving, urban decor',
      },
      outdoor: {
        modern: 'contemporary outdoor sofa, sleek loungers, minimalist planters, modern fire pit',
        traditional: 'classic patio set, garden furniture, decorative planters, traditional lighting',
        minimalist: 'simple outdoor seating, clean lines, minimal decor, subtle lighting',
        tropical: 'teak furniture, tropical plants, pool accessories, bamboo elements',
        luxury: 'designer outdoor furniture, elegant planters, premium lighting, water features',
        scandinavian: 'comfortable outdoor seating, natural wood, cozy textiles, simple design',
        industrial: 'metal outdoor furniture, urban planters, string lights, raw materials',
      },
    };

    const furniture = furnitureDescriptions[roomType]?.[style] || 'elegant modern furniture and decor';
    const customItems = furnitureItems?.join(', ') || '';
    
    const prompt = removeExisting
      ? `Remove all existing furniture from this ${roomType} and stage it with ${style} style interior design. Add ${furniture}${customItems ? `, and include ${customItems}` : ''}. Make it look professionally staged for a luxury real estate listing. The result should be photorealistic and naturally lit.`
      : `Stage this empty ${roomType} with ${style} style interior design. Add ${furniture}${customItems ? `, and include ${customItems}` : ''}. Make it look professionally staged for a luxury real estate listing. The result should be photorealistic and naturally lit, maintaining the original room architecture.`;

    // Call Lovable AI with image editing (Nano Banana model)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted, please add funds to your workspace' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const stagedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content || '';

    if (!stagedImageUrl) {
      throw new Error('No staged image generated');
    }

    return new Response(
      JSON.stringify({
        success: true,
        stagedImageUrl,
        description,
        roomType,
        style,
        prompt: prompt.substring(0, 200) + '...',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Virtual staging error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
