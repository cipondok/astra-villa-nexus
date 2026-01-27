import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert real estate listing analyst AI. Analyze property listings and predict their success probability.

## Your Analysis Framework:

### Input Factors to Evaluate:
1. **Property Attributes**: Type, size, bedrooms, bathrooms, location tier, amenities
2. **Listing Quality**: Photo count, description length/quality, title effectiveness
3. **Pricing Strategy**: Price vs market average, price per sqm competitiveness
4. **Market Conditions**: Location demand, seasonal factors, inventory levels
5. **Timing**: Day of week, time of year, market cycle position

### Output Format (ALWAYS return valid JSON):
{
  "successScore": <number 1-100>,
  "confidenceInterval": {
    "low": <number>,
    "high": <number>
  },
  "grade": "<A/B/C/D/F>",
  "timelinePrediction": {
    "estimatedDays": <number>,
    "range": "<string like '14-30 days'>"
  },
  "recommendations": [
    {
      "priority": <1-3>,
      "category": "<pricing|photos|description|timing|features>",
      "issue": "<what's wrong>",
      "action": "<specific action to take>",
      "impact": "<expected improvement>"
    }
  ],
  "strengthAnalysis": {
    "propertyScore": <0-100>,
    "listingQualityScore": <0-100>,
    "pricingScore": <0-100>,
    "marketFitScore": <0-100>,
    "timingScore": <0-100>
  },
  "competitivePosition": "<above_average|average|below_average>",
  "buyerDemographicFit": ["<demographic1>", "<demographic2>"],
  "riskFactors": ["<risk1>", "<risk2>"],
  "summary": "<2-3 sentence executive summary>"
}

### Scoring Guidelines:
- 90-100: Exceptional listing, expect quick sale/rent
- 75-89: Strong listing, good market fit
- 60-74: Average listing, may need improvements
- 40-59: Below average, significant improvements needed
- 1-39: Poor listing, major overhaul required

### Indonesian Market Context:
- Jakarta/Bali premium locations command higher prices
- Villa properties in tourist areas have seasonal demand
- Apartments near business districts favor working professionals
- Consider local holidays and Ramadan timing

Always provide actionable, specific recommendations with measurable impact estimates.`;

interface ListingData {
  // Property attributes
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  landAreaSqm?: number;
  location?: string;
  city?: string;
  state?: string;
  amenities?: string[];
  
  // Listing quality
  photoCount?: number;
  hasVirtualTour?: boolean;
  has3DModel?: boolean;
  descriptionLength?: number;
  descriptionQuality?: 'poor' | 'average' | 'good' | 'excellent';
  titleLength?: number;
  
  // Pricing
  price?: number;
  pricePerSqm?: number;
  listingType?: 'sale' | 'rent';
  marketAveragePrice?: number;
  
  // Timing
  listingDate?: string;
  dayOfWeek?: string;
  
  // Additional context
  competitorCount?: number;
  previousListingDays?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingData, useExample } = await req.json() as {
      listingData?: ListingData;
      useExample?: number;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Example scenarios for demonstration
    const exampleScenarios: ListingData[] = [
      // Example 1: Premium villa, well-optimized
      {
        propertyType: "Villa",
        bedrooms: 4,
        bathrooms: 4,
        areaSqm: 350,
        landAreaSqm: 500,
        location: "Seminyak",
        city: "Bali",
        amenities: ["Pool", "Garden", "Security", "Parking", "Ocean View"],
        photoCount: 25,
        hasVirtualTour: true,
        has3DModel: true,
        descriptionLength: 800,
        descriptionQuality: "excellent",
        titleLength: 65,
        price: 8500000000,
        pricePerSqm: 24285714,
        listingType: "sale",
        marketAveragePrice: 9000000000,
        dayOfWeek: "Tuesday",
        competitorCount: 12
      },
      // Example 2: Budget apartment, needs work
      {
        propertyType: "Apartment",
        bedrooms: 1,
        bathrooms: 1,
        areaSqm: 35,
        location: "Tangerang",
        city: "Jakarta",
        amenities: ["Parking"],
        photoCount: 3,
        hasVirtualTour: false,
        has3DModel: false,
        descriptionLength: 100,
        descriptionQuality: "poor",
        titleLength: 20,
        price: 450000000,
        pricePerSqm: 12857143,
        listingType: "sale",
        marketAveragePrice: 380000000,
        dayOfWeek: "Sunday",
        competitorCount: 45
      },
      // Example 3: Mid-range house, average optimization
      {
        propertyType: "House",
        bedrooms: 3,
        bathrooms: 2,
        areaSqm: 120,
        landAreaSqm: 150,
        location: "BSD City",
        city: "Tangerang",
        amenities: ["Garden", "Parking", "Security"],
        photoCount: 10,
        hasVirtualTour: false,
        has3DModel: false,
        descriptionLength: 350,
        descriptionQuality: "average",
        titleLength: 45,
        price: 2100000000,
        pricePerSqm: 17500000,
        listingType: "sale",
        marketAveragePrice: 2000000000,
        dayOfWeek: "Wednesday",
        competitorCount: 28
      },
      // Example 4: Luxury rental, great photos but overpriced
      {
        propertyType: "Penthouse",
        bedrooms: 3,
        bathrooms: 3,
        areaSqm: 200,
        location: "SCBD",
        city: "Jakarta",
        amenities: ["Pool", "Gym", "Concierge", "City View", "Smart Home"],
        photoCount: 30,
        hasVirtualTour: true,
        has3DModel: true,
        descriptionLength: 600,
        descriptionQuality: "excellent",
        titleLength: 70,
        price: 85000000,
        pricePerSqm: 425000,
        listingType: "rent",
        marketAveragePrice: 65000000,
        dayOfWeek: "Monday",
        competitorCount: 8
      },
      // Example 5: Land plot, minimal listing
      {
        propertyType: "Land",
        areaSqm: 1000,
        landAreaSqm: 1000,
        location: "Ubud",
        city: "Bali",
        amenities: ["Road Access", "Electricity"],
        photoCount: 5,
        hasVirtualTour: false,
        has3DModel: false,
        descriptionLength: 200,
        descriptionQuality: "average",
        titleLength: 30,
        price: 3500000000,
        pricePerSqm: 3500000,
        listingType: "sale",
        marketAveragePrice: 3800000000,
        dayOfWeek: "Thursday",
        competitorCount: 15
      }
    ];

    const dataToAnalyze = useExample !== undefined 
      ? exampleScenarios[useExample - 1] 
      : listingData;

    if (!dataToAnalyze) {
      throw new Error("No listing data provided");
    }

    const userPrompt = `Analyze this property listing and predict its success probability:

## Listing Data:
${JSON.stringify(dataToAnalyze, null, 2)}

## Analysis Request:
1. Calculate a success score (1-100) based on all factors
2. Provide exactly 3 prioritized improvement recommendations
3. Estimate time to sale/rent with confidence interval
4. Identify the target buyer/renter demographic
5. List any risk factors

Return ONLY valid JSON matching the specified output format.`;

    console.log("Analyzing listing:", dataToAnalyze.propertyType, dataToAnalyze.location);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI prediction");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from the response
    let prediction;
    try {
      // Try to parse directly first
      prediction = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try to find JSON object in the response
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          prediction = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
    }

    console.log("Prediction generated:", prediction.successScore, prediction.grade);

    return new Response(
      JSON.stringify({
        prediction,
        inputData: dataToAnalyze,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Listing success predictor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
