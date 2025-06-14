
-- Add a column to store admin responses to feedback
ALTER TABLE public.feedback_monitoring
ADD COLUMN admin_response TEXT;
