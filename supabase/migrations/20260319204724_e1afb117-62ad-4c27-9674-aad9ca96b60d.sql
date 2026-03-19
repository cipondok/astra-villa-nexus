
-- Deal Stage Guard Rules - controls valid transitions
CREATE TABLE IF NOT EXISTS public.deal_stage_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_stage text NOT NULL,
  to_stage text NOT NULL,
  allowed_roles text[] NOT NULL DEFAULT '{admin}',
  required_flags jsonb DEFAULT '{}'::jsonb,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_stage, to_stage)
);

ALTER TABLE public.deal_stage_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read deal stage rules" ON public.deal_stage_rules
  FOR SELECT TO authenticated
  USING (true);

-- Seed valid transitions
INSERT INTO public.deal_stage_rules (from_stage, to_stage, allowed_roles, required_flags, description) VALUES
  ('inquiry', 'viewing', '{agent,admin}', '{}', 'Agent schedules viewing after inquiry'),
  ('viewing', 'offer', '{investor,admin}', '{"viewing_completed": true}', 'Investor submits offer after viewing'),
  ('offer', 'negotiation', '{agent,owner,admin}', '{}', 'Counter-offer or negotiation begins'),
  ('negotiation', 'payment_initiated', '{investor,admin}', '{"offer_accepted": true}', 'Buyer initiates payment after accepted offer'),
  ('payment_initiated', 'legal_verification', '{admin,agent}', '{"escrow_funded": true}', 'Legal review after escrow funded'),
  ('legal_verification', 'closed', '{admin}', '{"legal_cleared": true}', 'Admin closes deal after legal clearance'),
  ('offer', 'payment_initiated', '{investor,admin}', '{"offer_accepted": true}', 'Direct payment after accepted offer (skip negotiation)'),
  ('inquiry', 'offer', '{investor,admin}', '{}', 'Direct offer without viewing')
ON CONFLICT (from_stage, to_stage) DO NOTHING;
