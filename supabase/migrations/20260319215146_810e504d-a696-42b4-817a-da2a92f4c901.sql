
-- Fix overly permissive ALL policy on asset_lifecycle_tracker
DROP POLICY IF EXISTS "Owners manage own assets" ON asset_lifecycle_tracker;

CREATE POLICY "Owners update own assets" ON asset_lifecycle_tracker
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners insert own assets" ON asset_lifecycle_tracker
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners delete own assets" ON asset_lifecycle_tracker
  FOR DELETE USING (auth.uid() = owner_id);
