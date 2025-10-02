-- Create load_test_results table
CREATE TABLE IF NOT EXISTS public.load_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type TEXT NOT NULL,
  target_url TEXT,
  total_requests INTEGER NOT NULL,
  successful_requests INTEGER NOT NULL,
  failed_requests INTEGER NOT NULL,
  average_response_time NUMERIC NOT NULL,
  min_response_time NUMERIC NOT NULL,
  max_response_time NUMERIC NOT NULL,
  requests_per_second NUMERIC NOT NULL,
  error_rate NUMERIC NOT NULL,
  p50_response_time NUMERIC NOT NULL,
  p95_response_time NUMERIC NOT NULL,
  p99_response_time NUMERIC NOT NULL,
  test_duration NUMERIC NOT NULL,
  concurrency INTEGER NOT NULL,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.load_test_results ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all test results
CREATE POLICY "Admins can view all load test results"
ON public.load_test_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy for system to insert test results
CREATE POLICY "System can insert load test results"
ON public.load_test_results
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_load_test_results_created_at 
ON public.load_test_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_load_test_results_test_type 
ON public.load_test_results(test_type);