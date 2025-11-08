-- Create activity logs table for tracking user activities
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  location_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity logs
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (true);

-- Create function to log profile updates
CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if there are actual changes
  IF OLD IS DISTINCT FROM NEW THEN
    INSERT INTO public.activity_logs (
      user_id,
      activity_type,
      activity_description,
      metadata
    ) VALUES (
      NEW.id,
      'profile_update',
      'Profile information updated',
      jsonb_build_object(
        'changes', jsonb_build_object(
          'full_name', CASE WHEN OLD.full_name IS DISTINCT FROM NEW.full_name THEN jsonb_build_object('old', OLD.full_name, 'new', NEW.full_name) ELSE NULL END,
          'phone', CASE WHEN OLD.phone IS DISTINCT FROM NEW.phone THEN jsonb_build_object('old', OLD.phone, 'new', NEW.phone) ELSE NULL END,
          'bio', CASE WHEN OLD.bio IS DISTINCT FROM NEW.bio THEN jsonb_build_object('old', LEFT(OLD.bio, 50), 'new', LEFT(NEW.bio, 50)) ELSE NULL END,
          'avatar_url', CASE WHEN OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN jsonb_build_object('changed', true) ELSE NULL END
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS log_profile_update_trigger ON public.profiles;
CREATE TRIGGER log_profile_update_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_profile_update();