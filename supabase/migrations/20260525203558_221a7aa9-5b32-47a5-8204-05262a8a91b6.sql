
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_uniq ON public.admin_users(user_id) WHERE user_id IS NOT NULL;
