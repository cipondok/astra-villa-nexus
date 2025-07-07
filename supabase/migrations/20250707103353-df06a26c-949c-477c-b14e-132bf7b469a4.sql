-- Create table to track database errors and their fixes
CREATE TABLE IF NOT EXISTS public.database_error_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_signature TEXT NOT NULL, -- Hash of error message for deduplication
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_severity TEXT NOT NULL DEFAULT 'ERROR',
  table_name TEXT,
  suggested_fix TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  fix_applied TEXT, -- What fix was applied
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  occurrence_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_database_error_signature ON public.database_error_tracking(error_signature);
CREATE INDEX IF NOT EXISTS idx_database_error_resolved ON public.database_error_tracking(is_resolved);
CREATE INDEX IF NOT EXISTS idx_database_error_type ON public.database_error_tracking(error_type);

-- Enable RLS
ALTER TABLE public.database_error_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage database error tracking" 
ON public.database_error_tracking 
FOR ALL 
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Create function to generate error signature
CREATE OR REPLACE FUNCTION public.generate_error_signature(error_message TEXT, table_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(COALESCE(table_name, '') || '|' || error_message, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create function to log or update database error
CREATE OR REPLACE FUNCTION public.log_database_error(
  p_error_type TEXT,
  p_error_message TEXT,
  p_error_severity TEXT DEFAULT 'ERROR',
  p_table_name TEXT DEFAULT NULL,
  p_suggested_fix TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  error_sig TEXT;
  existing_error_id UUID;
  result_id UUID;
BEGIN
  -- Generate error signature
  error_sig := generate_error_signature(p_error_message, p_table_name);
  
  -- Check if error already exists
  SELECT id INTO existing_error_id
  FROM public.database_error_tracking
  WHERE error_signature = error_sig
  AND is_resolved = false;
  
  IF existing_error_id IS NOT NULL THEN
    -- Update existing error
    UPDATE public.database_error_tracking
    SET 
      last_seen_at = now(),
      occurrence_count = occurrence_count + 1,
      updated_at = now()
    WHERE id = existing_error_id;
    
    result_id := existing_error_id;
  ELSE
    -- Insert new error
    INSERT INTO public.database_error_tracking (
      error_signature,
      error_type,
      error_message,
      error_severity,
      table_name,
      suggested_fix,
      metadata
    ) VALUES (
      error_sig,
      p_error_type,
      p_error_message,
      p_error_severity,
      p_table_name,
      p_suggested_fix,
      p_metadata
    ) RETURNING id INTO result_id;
  END IF;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark error as resolved
CREATE OR REPLACE FUNCTION public.resolve_database_error(
  p_error_signature TEXT,
  p_fix_applied TEXT,
  p_resolved_by UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE public.database_error_tracking
  SET 
    is_resolved = true,
    resolved_at = now(),
    resolved_by = p_resolved_by,
    fix_applied = p_fix_applied,
    updated_at = now()
  WHERE error_signature = p_error_signature
  AND is_resolved = false;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;