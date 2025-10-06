-- Enable public submissions to feedback_monitoring table
CREATE POLICY "Allow public feedback submissions"
ON public.feedback_monitoring
FOR INSERT
TO anon, authenticated
WITH CHECK (true);