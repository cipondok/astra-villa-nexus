
CREATE OR REPLACE FUNCTION public.generate_seo_location_blueprint(
  p_province text DEFAULT '',
  p_city text DEFAULT '',
  p_district text DEFAULT '',
  p_village text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  loc_level text;
  loc_label text;
  loc_full text;
  listing_count int := 0;
  avg_price numeric := 0;
  min_price numeric := 0;
  max_price numeric := 0;
  median_price numeric := 0;
  avg_investment numeric := 0;
  avg_demand numeric := 0;
  avg_growth numeric := 0;
  avg_liquidity numeric := 0;
  type_dist jsonb := '{}';
  nearby_areas jsonb := '[]';
  parent_city text;
  seo_title text;
  meta_desc text;
  intro_content text;
  keywords jsonb;
  internal_links jsonb;
  price_formatted text;
  market_signal text;
  r record;
BEGIN
  -- Determine location level
  IF p_village <> '' AND p_village IS NOT NULL THEN
    loc_level := 'kelurahan';
    loc_label := p_village;
    loc_full := p_village || ', ' || p_district || ', ' || p_city || ', ' || p_province;
  ELSIF p_district <> '' AND p_district IS NOT NULL THEN
    loc_level := 'kecamatan';
    loc_label := p_district;
    loc_full := p_district || ', ' || p_city || ', ' || p_province;
  ELSIF p_city <> '' AND p_city IS NOT NULL THEN
    loc_level := 'city';
    loc_label := p_city;
    loc_full := p_city || ', ' || p_province;
  ELSE
    loc_level := 'province';
    loc_label := p_province;
    loc_full := p_province;
  END IF;

  parent_city := COALESCE(NULLIF(p_city, ''), p_province);

  -- Aggregate listing data
  SELECT
    COUNT(*),
    COALESCE(AVG(p.price), 0),
    COALESCE(MIN(p.price), 0),
    COALESCE(MAX(p.price), 0),
    COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.price), 0)
  INTO listing_count, avg_price, min_price, max_price, median_price
  FROM properties p
  WHERE p.status IN ('available', 'active')
    AND (p_province = '' OR p.province ILIKE '%' || p_province || '%')
    AND (p_city = '' OR p.city ILIKE '%' || p_city || '%')
    AND (p_district = '' OR p.district ILIKE '%' || p_district || '%')
    AND (p_village = '' OR p.village ILIKE '%' || p_village || '%');

  -- Property type distribution
  SELECT COALESCE(jsonb_object_agg(pt, cnt), '{}')
  INTO type_dist
  FROM (
    SELECT p.property_type AS pt, COUNT(*) AS cnt
    FROM properties p
    WHERE p.status IN ('available', 'active')
      AND (p_province = '' OR p.province ILIKE '%' || p_province || '%')
      AND (p_city = '' OR p.city ILIKE '%' || p_city || '%')
      AND (p_district = '' OR p.district ILIKE '%' || p_district || '%')
      AND (p_village = '' OR p.village ILIKE '%' || p_village || '%')
    GROUP BY p.property_type
    ORDER BY cnt DESC
    LIMIT 6
  ) sub;

  -- Investment scores from hotspots
  SELECT
    COALESCE(ih.demand_score, 0),
    COALESCE(ih.growth_score, 0),
    COALESCE(ih.liquidity_score, 0),
    COALESCE(ih.hotspot_score, 0)
  INTO avg_demand, avg_growth, avg_liquidity, avg_investment
  FROM investment_hotspots ih
  WHERE ih.city ILIKE '%' || parent_city || '%'
  ORDER BY ih.updated_at DESC
  LIMIT 1;

  -- Market signal classification
  IF avg_demand >= 65 AND avg_growth >= 60 THEN
    market_signal := 'HIGH_DEMAND';
  ELSIF avg_growth >= 55 THEN
    market_signal := 'GROWING';
  ELSIF avg_demand >= 45 AND avg_liquidity >= 45 THEN
    market_signal := 'STABLE';
  ELSE
    market_signal := 'EMERGING';
  END IF;

  -- Format median price
  IF median_price >= 1000000000 THEN
    price_formatted := ROUND(median_price / 1000000000.0, 1) || ' Miliar';
  ELSIF median_price >= 1000000 THEN
    price_formatted := ROUND(median_price / 1000000.0, 0) || ' Juta';
  ELSE
    price_formatted := to_char(median_price, 'FM999,999,999');
  END IF;

  -- === Generate SEO Title variants ===
  seo_title := CASE loc_level
    WHEN 'kelurahan' THEN 'Rumah Dijual di ' || loc_label || ' ' || p_district || ' - Harga Mulai Rp ' || price_formatted
    WHEN 'kecamatan' THEN 'Properti Dijual di ' || loc_label || ' ' || p_city || ' - ' || listing_count || ' Listing Tersedia'
    WHEN 'city' THEN 'Jual Beli Properti di ' || loc_label || ' - Investasi & Hunian Terbaik ' || EXTRACT(YEAR FROM now())::text
    ELSE 'Properti di ' || loc_label || ' - Panduan Investasi Properti ' || EXTRACT(YEAR FROM now())::text
  END;

  -- === Generate Meta Description ===
  meta_desc := CASE market_signal
    WHEN 'HIGH_DEMAND' THEN
      'Temukan ' || listing_count || ' properti di ' || loc_label || ' dengan harga mulai Rp ' || price_formatted
      || '. Pasar sedang tinggi permintaan dengan pertumbuhan investasi kuat. Cari rumah, apartemen, dan ruko terbaik sekarang.'
    WHEN 'GROWING' THEN
      'Jelajahi ' || listing_count || ' listing properti di ' || loc_label || '. Kawasan berkembang dengan potensi investasi menjanjikan.'
      || ' Harga median Rp ' || price_formatted || '. Temukan peluang terbaik Anda.'
    WHEN 'STABLE' THEN
      'Cari properti di ' || loc_label || ' — ' || listing_count || ' pilihan tersedia mulai Rp ' || price_formatted
      || '. Pasar stabil cocok untuk hunian maupun investasi jangka panjang.'
    ELSE
      'Eksplorasi ' || listing_count || ' properti di ' || loc_label || ' dengan harga terjangkau mulai Rp ' || price_formatted
      || '. Kawasan emerging dengan potensi pertumbuhan tinggi untuk investor early-mover.'
  END;

  -- === Generate Intro Content (300-400 words equivalent structure) ===
  intro_content := format(
    E'%s merupakan salah satu kawasan %s di %s yang menawarkan beragam pilihan properti untuk pembeli, penyewa, dan investor.\n\n'
    || E'Saat ini terdapat %s listing aktif di area ini dengan harga median Rp %s. '
    || E'Rentang harga bervariasi dari Rp %s hingga Rp %s, memberikan opsi untuk berbagai segmen pasar.\n\n'
    || E'Dari sisi investasi, kawasan ini menunjukkan sinyal %s — skor permintaan pasar berada di %s/100 '
    || E'dengan pertumbuhan %s/100 dan likuiditas %s/100. '
    || E'%s\n\n'
    || E'Untuk pembeli yang mencari hunian, %s menawarkan akses ke fasilitas publik, pusat perbelanjaan, dan jaringan transportasi. '
    || E'Bagi investor, kombinasi harga entry-point dan tren pertumbuhan menjadikan area ini layak dipertimbangkan dalam portofolio properti.',
    loc_label,
    CASE market_signal
      WHEN 'HIGH_DEMAND' THEN 'paling diminati'
      WHEN 'GROWING' THEN 'berkembang pesat'
      WHEN 'STABLE' THEN 'stabil dan mapan'
      ELSE 'berkembang dengan potensi besar'
    END,
    COALESCE(NULLIF(p_city, ''), p_province),
    listing_count,
    price_formatted,
    CASE WHEN min_price >= 1e9 THEN ROUND(min_price/1e9, 1) || ' Miliar'
         WHEN min_price >= 1e6 THEN ROUND(min_price/1e6, 0) || ' Juta'
         ELSE to_char(min_price, 'FM999,999,999') END,
    CASE WHEN max_price >= 1e9 THEN ROUND(max_price/1e9, 1) || ' Miliar'
         WHEN max_price >= 1e6 THEN ROUND(max_price/1e6, 0) || ' Juta'
         ELSE to_char(max_price, 'FM999,999,999') END,
    CASE market_signal
      WHEN 'HIGH_DEMAND' THEN 'kuat'
      WHEN 'GROWING' THEN 'positif'
      WHEN 'STABLE' THEN 'moderat'
      ELSE 'awal namun menjanjikan'
    END,
    ROUND(avg_demand),
    ROUND(avg_growth),
    ROUND(avg_liquidity),
    CASE market_signal
      WHEN 'HIGH_DEMAND' THEN 'Ini menunjukkan pasar yang sangat aktif — properti cenderung terjual lebih cepat dengan kompetisi yang ketat antar pembeli.'
      WHEN 'GROWING' THEN 'Tren ini mengindikasikan potensi capital gain yang menarik dalam 2-3 tahun ke depan.'
      WHEN 'STABLE' THEN 'Kondisi ini ideal untuk investor yang mengutamakan stabilitas dan pendapatan sewa rutin.'
      ELSE 'Area emerging seperti ini sering memberikan return tertinggi bagi investor yang masuk di tahap awal siklus pertumbuhan.'
    END,
    loc_label
  );

  -- === Keyword Clusters ===
  keywords := jsonb_build_object(
    'transactional', jsonb_build_array(
      'jual rumah di ' || loc_label,
      'beli rumah ' || loc_label,
      'rumah dijual ' || loc_label || ' ' || EXTRACT(YEAR FROM now())::text,
      'properti dijual di ' || loc_label,
      'harga rumah di ' || loc_label,
      'rumah murah ' || loc_label,
      'rumah baru ' || loc_label
    ),
    'rental', jsonb_build_array(
      'sewa rumah ' || loc_label,
      'sewa apartemen ' || loc_label,
      'kost ' || loc_label,
      'kontrakan ' || loc_label,
      'sewa ruko ' || loc_label
    ),
    'investment', jsonb_build_array(
      'investasi properti ' || loc_label,
      'investasi properti ' || parent_city,
      'ROI properti ' || loc_label,
      'properti investasi terbaik ' || parent_city,
      'properti capital gain ' || loc_label
    ),
    'informational', jsonb_build_array(
      'harga tanah ' || loc_label || ' per meter',
      'perkembangan properti ' || loc_label,
      'infrastruktur ' || loc_label,
      'prospek properti ' || parent_city || ' ' || EXTRACT(YEAR FROM now())::text,
      'pasar properti ' || parent_city
    ),
    'long_tail', jsonb_build_array(
      'rumah 2 kamar tidur dijual di ' || loc_label,
      'rumah dengan taman dijual ' || loc_label,
      'apartemen studio murah ' || loc_label,
      'tanah kavling ' || loc_label || ' SHM',
      'rumah KPR ' || loc_label || ' DP rendah'
    )
  );

  -- === Nearby areas for internal linking ===
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'area', sub.area_name,
    'listing_count', sub.cnt,
    'link_type', sub.ltype
  )), '[]'::jsonb)
  INTO nearby_areas
  FROM (
    -- Same city, different districts
    SELECT DISTINCT p.district AS area_name, COUNT(*) AS cnt, 'nearby_area' AS ltype
    FROM properties p
    WHERE p.city ILIKE '%' || parent_city || '%'
      AND p.district IS NOT NULL
      AND p.district <> ''
      AND p.district <> COALESCE(NULLIF(p_district, ''), '___none___')
      AND p.status IN ('available', 'active')
    GROUP BY p.district
    ORDER BY cnt DESC
    LIMIT 5
  ) sub;

  -- === Internal linking strategy ===
  internal_links := jsonb_build_object(
    'parent_pages', jsonb_build_array(
      jsonb_build_object(
        'label', 'Properti di ' || parent_city,
        'slug', '/properti/' || lower(replace(parent_city, ' ', '-')),
        'rel', 'parent_city'
      ),
      jsonb_build_object(
        'label', 'Properti di ' || p_province,
        'slug', '/properti/' || lower(replace(p_province, ' ', '-')),
        'rel', 'parent_province'
      )
    ),
    'nearby_areas', nearby_areas,
    'contextual_links', jsonb_build_array(
      jsonb_build_object(
        'label', 'Hotspot Investasi ' || parent_city,
        'slug', '/investasi/' || lower(replace(parent_city, ' ', '-')),
        'rel', 'investment_hotspot'
      ),
      jsonb_build_object(
        'label', 'Tren Harga Properti ' || parent_city,
        'slug', '/tren-harga/' || lower(replace(parent_city, ' ', '-')),
        'rel', 'price_trend'
      ),
      jsonb_build_object(
        'label', 'Panduan KPR ' || parent_city,
        'slug', '/kpr/' || lower(replace(parent_city, ' ', '-')),
        'rel', 'mortgage_guide'
      )
    ),
    'collection_links', jsonb_build_array(
      jsonb_build_object(
        'label', 'Rumah Dijual di ' || parent_city,
        'slug', '/rumah-dijual/' || lower(replace(parent_city, ' ', '-')),
        'rel', 'collection_house'
      ),
      jsonb_build_object(
        'label', 'Apartemen di ' || parent_city,
        'slug', '/apartemen/' || lower(replace(parent_city, ' ', '-')),
        'rel', 'collection_apartment'
      ),
      jsonb_build_object(
        'label', 'Tanah Dijual di ' || parent_city,
        'slug', '/tanah-dijual/' || lower(replace(parent_city, ' ', '-')),
        'rel', 'collection_land'
      )
    )
  );

  RETURN jsonb_build_object(
    'location', jsonb_build_object(
      'level', loc_level,
      'label', loc_label,
      'full_path', loc_full,
      'province', p_province,
      'city', p_city,
      'district', p_district,
      'village', p_village
    ),
    'seo_title', seo_title,
    'meta_description', meta_desc,
    'intro_content', intro_content,
    'keyword_clusters', keywords,
    'internal_links', internal_links,
    'market_data', jsonb_build_object(
      'listing_count', listing_count,
      'avg_price', ROUND(avg_price),
      'median_price', ROUND(median_price),
      'min_price', ROUND(min_price),
      'max_price', ROUND(max_price),
      'price_formatted', 'Rp ' || price_formatted,
      'demand_score', ROUND(avg_demand),
      'growth_score', ROUND(avg_growth),
      'liquidity_score', ROUND(avg_liquidity),
      'investment_score', ROUND(avg_investment),
      'market_signal', market_signal,
      'property_types', type_dist
    ),
    'page_slug', '/' || lower(replace(replace(loc_full, ', ', '/'), ' ', '-')),
    'generated_at', now()
  );
END;
$$;
