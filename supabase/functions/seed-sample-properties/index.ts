import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 5; // kelurahan per batch
const PROPERTY_TYPES = ["house", "apartment", "villa", "land", "commercial", "townhouse", "warehouse", "kost"];

const LISTING_TYPES = ["sale", "rent"];
const FURNISHING = ["unfurnished", "semi-furnished", "fully-furnished"];
const LEGAL = ["SHM", "HGB", "SHGB", "Girik", "AJB"];
const VIEW_TYPES = ["garden", "city", "mountain", "ocean", "pool", "rice-field", "river"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePrice(type: string, listing: string): number {
  const bases: Record<string, [number, number]> = {
    house: [500_000_000, 5_000_000_000],
    apartment: [300_000_000, 3_000_000_000],
    villa: [1_000_000_000, 15_000_000_000],
    land: [200_000_000, 8_000_000_000],
    commercial: [1_000_000_000, 20_000_000_000],
    townhouse: [400_000_000, 4_000_000_000],
    warehouse: [2_000_000_000, 25_000_000_000],
    kost: [300_000_000, 3_000_000_000],
  };
  const [min, max] = bases[type] || [500_000_000, 5_000_000_000];
  let price = rand(min, max);
  // Round to millions
  price = Math.round(price / 1_000_000) * 1_000_000;
  if (listing === "rent") {
    // Monthly rent = roughly price / 120..200
    price = Math.round(price / rand(120, 200) / 100_000) * 100_000;
  }
  return price;
}

function generateProperty(
  type: string,
  loc: { province_name: string; city_name: string; city_type: string; district_name: string; subdistrict_name: string; postal_code: string }
) {
  const listing = pick(LISTING_TYPES);
  const price = generatePrice(type, listing);
  const bedrooms = type === "land" || type === "warehouse" ? 0 : rand(1, 6);
  const bathrooms = type === "land" || type === "warehouse" ? 0 : rand(1, Math.max(1, bedrooms));
  const landArea = rand(60, 2000);
  const buildingArea = type === "land" ? 0 : rand(36, Math.min(landArea, 800));
  const floors = type === "land" ? 0 : rand(1, 3);
  const cityFull = loc.city_type ? `${loc.city_type} ${loc.city_name}` : loc.city_name;
  const area = loc.subdistrict_name || loc.district_name;

  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} di ${area}, ${cityFull}`;
  const description = `Properti ${type} ${listing === "rent" ? "disewakan" : "dijual"} di ${area}, ${loc.district_name}, ${cityFull}, ${loc.province_name}. Luas tanah ${landArea}m², luas bangunan ${buildingArea}m². ${bedrooms > 0 ? `${bedrooms} kamar tidur, ${bathrooms} kamar mandi.` : ""} Lokasi strategis.`;

  return {
    title,
    description,
    property_type: type,
    listing_type: listing,
    price,
    location: `${area}, ${loc.district_name}, ${cityFull}`,
    state: loc.province_name,
    city: cityFull,
    area,
    bedrooms,
    bathrooms,
    land_area_sqm: landArea,
    building_area_sqm: buildingArea || null,
    area_sqm: buildingArea || landArea,
    floors: floors || null,
    has_pool: type === "villa" ? Math.random() > 0.4 : Math.random() > 0.85,
    garage_count: rand(0, 2),
    view_type: pick(VIEW_TYPES),
    furnishing: type === "land" || type === "warehouse" ? "unfurnished" : pick(FURNISHING),
    legal_status: pick(LEGAL),
    status: "active",
    approval_status: "approved",
    wna_eligible: Math.random() > 0.7,
    is_featured: Math.random() > 0.9,
    investment_score: rand(30, 95),
    property_features: {
      parking: rand(0, 3),
      ac: rand(0, bedrooms),
      wifi: Math.random() > 0.3,
    },
    listed_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is admin
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { province, offset = 0, skipExisting = true } = body;

    if (!province) {
      return new Response(JSON.stringify({ error: "Province required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get distinct kelurahan/desa for this province, paginated
    const { data: locations, error: locErr } = await supabase
      .from("locations")
      .select("province_name, city_name, city_type, district_name, subdistrict_name, postal_code")
      .eq("province_name", province)
      .eq("is_active", true)
      .not("subdistrict_name", "is", null)
      .order("subdistrict_name")
      .range(offset * BATCH_SIZE, (offset + 1) * BATCH_SIZE - 1);

    // Deduplicate by subdistrict_name
    const seen = new Set<string>();
    const uniqueLocations = (locations || []).filter((l) => {
      if (seen.has(l.subdistrict_name)) return false;
      seen.add(l.subdistrict_name);
      return true;
    });

    if (locErr || uniqueLocations.length === 0) {
      return new Response(
        JSON.stringify({
          created: 0,
          skipped: 0,
          errors: 0,
          batchProcessed: 0,
          hasMore: false,
          nextOffset: null,
          locations_processed: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;
    const locationsProcessed: Array<{ city: string; area: string; types_created: number }> = [];

    for (const loc of uniqueLocations) {
      const cityFull = loc.city_type ? `${loc.city_type} ${loc.city_name}` : loc.city_name;
      const area = loc.subdistrict_name || loc.district_name;
      let typesCreated = 0;

      for (const type of PROPERTY_TYPES) {
        try {
          if (skipExisting) {
            const { count } = await supabase
              .from("properties")
              .select("id", { count: "exact", head: true })
              .eq("state", province)
              .eq("city", cityFull)
              .eq("area", area)
              .eq("property_type", type);

            if (count && count > 0) {
              skipped++;
              continue;
            }
          }

          const property = generateProperty(type, loc);
          const { error: insertErr } = await supabase.from("properties").insert(property);

          if (insertErr) {
            console.error(`Insert error for ${type} in ${area}:`, insertErr.message);
            errors++;
          } else {
            created++;
            typesCreated++;
          }
        } catch (e) {
          console.error(`Error for ${type} in ${area}:`, e);
          errors++;
        }
      }

      locationsProcessed.push({ city: cityFull, area, types_created: typesCreated });
    }

    // Count total kelurahan to determine hasMore
    const { count: totalKelurahan } = await supabase
      .from("locations")
      .select("subdistrict_name", { count: "exact", head: true })
      .eq("province_name", province)
      .eq("is_active", true)
      .not("subdistrict_name", "is", null);

    const nextOffset = offset + 1;
    const hasMore = nextOffset * BATCH_SIZE < (totalKelurahan || 0);

    return new Response(
      JSON.stringify({
        created,
        skipped,
        errors,
        batchProcessed: uniqueLocations.length,
        hasMore,
        nextOffset: hasMore ? nextOffset : null,
        total_kelurahan: totalKelurahan,
        locations_processed: locationsProcessed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("seed-sample-properties error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
