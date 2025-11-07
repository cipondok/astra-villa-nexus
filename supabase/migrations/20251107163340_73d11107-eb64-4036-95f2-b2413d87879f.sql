-- Create user_searches table for syncing saved searches across devices
CREATE TABLE IF NOT EXISTS public.user_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT,
  filters JSONB,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own searches" 
ON public.user_searches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own searches" 
ON public.user_searches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own searches" 
ON public.user_searches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches" 
ON public.user_searches 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.user_searches REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_searches;

-- Create index for faster queries
CREATE INDEX idx_user_searches_user_id ON public.user_searches(user_id);
CREATE INDEX idx_user_searches_timestamp ON public.user_searches(timestamp DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_searches_updated_at
BEFORE UPDATE ON public.user_searches
FOR EACH ROW
EXECUTE FUNCTION public.update_user_searches_updated_at();