-- Drop existing insert policy that requires authentication
DROP POLICY IF EXISTS "restrictive_survey_bookings_insert" ON property_survey_bookings;

-- Create new policy allowing anyone to book a survey (guest users included)
CREATE POLICY "allow_survey_bookings_insert" 
ON property_survey_bookings 
FOR INSERT 
WITH CHECK (true);

-- Also ensure the table has RLS enabled but allows public inserts
ALTER TABLE property_survey_bookings ENABLE ROW LEVEL SECURITY;