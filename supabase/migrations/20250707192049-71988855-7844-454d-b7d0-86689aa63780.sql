-- Add demo 3D URLs to existing properties for testing

-- Update properties with Matterport virtual tours
UPDATE properties 
SET virtual_tour_url = 'https://my.matterport.com/show/?m=SxQL3iGyoDo'
WHERE id IN (
  'e8f97d23-32d1-4c23-b14b-44693a240bac', -- GWR Great Western Resort 2BR Apartment
  '5007bddb-c21b-41cc-a557-b8fc2211380e', -- Penthouse Surabaya  
  '46b67aea-5509-4218-9c2e-da00a76d6635', -- Beachfront Resort Lombok
  '5e474d40-5286-478c-9255-bacb85a3642a'  -- Luxury Condo Makassar
);

-- Update properties with Sketchfab 3D models
UPDATE properties 
SET three_d_model_url = 'https://sketchfab.com/models/76f0ff8d1c8a4e5a9b9c8c7c3c6c4c1c/embed'
WHERE id IN (
  '6869d8c2-a421-4486-a3b9-d2fb00f39893', -- Garden House Cimahi
  '472f85b1-678c-42ee-9b6a-fb31d30c0cc1', -- Heritage House Semarang
  '3ea28b9e-837c-4e70-a29f-3fe0bdbcaa3c', -- Affordable Townhouse Bekasi
  '540e9548-259c-4b98-a705-849d186fca63'  -- Office Space Medan
);

-- Update some properties with both virtual tour AND 3D model
UPDATE properties 
SET 
  virtual_tour_url = 'https://my.matterport.com/show/?m=SxQL3iGyoDo',
  three_d_model_url = 'https://sketchfab.com/models/76f0ff8d1c8a4e5a9b9c8c7c3c6c4c1c/embed'
WHERE id IN (
  '6fd0a1da-cd82-42b8-bb0f-47a119008c38', -- Rumah Termurah Dijual Jakarta Pusat
  '26cc7705-8c79-40bb-ac1a-f3a65f2c3c0f'  -- Compact Studio Surakarta
);

-- Add some additional demo virtual tour URLs for variety
UPDATE properties 
SET virtual_tour_url = 'https://my.matterport.com/show/?m=j4RZx7ZGM6T'
WHERE three_d_model_url IS NULL 
  AND virtual_tour_url IS NULL 
  AND property_type IN ('villa', 'house')
  AND id NOT IN (
    'e8f97d23-32d1-4c23-b14b-44693a240bac',
    '5007bddb-c21b-41cc-a557-b8fc2211380e', 
    '46b67aea-5509-4218-9c2e-da00a76d6635',
    '5e474d40-5286-478c-9255-bacb85a3642a',
    '6869d8c2-a421-4486-a3b9-d2fb00f39893',
    '472f85b1-678c-42ee-9b6a-fb31d30c0cc1',
    '3ea28b9e-837c-4e70-a29f-3fe0bdbcaa3c',
    '540e9548-259c-4b98-a705-849d186fca63',
    '6fd0a1da-cd82-42b8-bb0f-47a119008c38',
    '26cc7705-8c79-40bb-ac1a-f3a65f2c3c0f'
  )
LIMIT 5;