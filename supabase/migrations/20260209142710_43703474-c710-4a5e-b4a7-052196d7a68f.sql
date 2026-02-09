
-- Assign images to apartments in Jakarta
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
WHERE property_type = 'apartment' AND location ILIKE '%Jakarta%'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to apartments in Bali (Studio)
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
WHERE property_type = 'apartment' AND location ILIKE '%Bali%'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to apartments (other locations like BSD)
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
WHERE property_type = 'apartment' AND location NOT ILIKE '%Jakarta%' AND location NOT ILIKE '%Bali%'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to commercial properties
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
WHERE property_type = 'commercial'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to houses in Yogyakarta
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop'
WHERE property_type = 'house' AND location ILIKE '%Yogyakarta%'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to houses in Bandung
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop'
WHERE property_type = 'house' AND location ILIKE '%Bandung%'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to houses (other locations)
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop'
WHERE property_type = 'house' AND location NOT ILIKE '%Yogyakarta%' AND location NOT ILIKE '%Bandung%'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to land properties
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'
WHERE property_type = 'land'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to townhouses
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop'
WHERE property_type = 'townhouse'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');

-- Assign images to villas
UPDATE properties SET 
  image_urls = ARRAY[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
  ],
  thumbnail_url = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'
WHERE property_type = 'villa'
  AND thumbnail_url IS NULL AND images IS NULL AND (image_urls IS NULL OR image_urls::text = '[]');
