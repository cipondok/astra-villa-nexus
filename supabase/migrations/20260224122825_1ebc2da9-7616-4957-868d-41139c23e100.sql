
-- Add email_notifications and is_active columns to user_searches
ALTER TABLE public.user_searches 
  ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add RLS policies for user_searches
ALTER TABLE public.user_searches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_searches' AND policyname = 'Users can view own searches') THEN
    CREATE POLICY "Users can view own searches" ON public.user_searches FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_searches' AND policyname = 'Users can insert own searches') THEN
    CREATE POLICY "Users can insert own searches" ON public.user_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_searches' AND policyname = 'Users can update own searches') THEN
    CREATE POLICY "Users can update own searches" ON public.user_searches FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_searches' AND policyname = 'Users can delete own searches') THEN
    CREATE POLICY "Users can delete own searches" ON public.user_searches FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Also ensure search_notifications has RLS
ALTER TABLE public.search_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_notifications' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON public.search_notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_notifications' AND policyname = 'Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON public.search_notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
