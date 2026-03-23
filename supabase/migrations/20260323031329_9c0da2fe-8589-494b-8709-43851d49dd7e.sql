
-- PHASE 1: Custody Accounts
CREATE TABLE public.custody_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL DEFAULT 'investor' CHECK (entity_type IN ('investor','fund','platform_spv','institutional_partner')),
  entity_reference_id uuid,
  custody_provider_code text DEFAULT 'internal' CHECK (custody_provider_code IN ('internal','bank_partner','trustee','digital_custodian')),
  jurisdiction_code text DEFAULT 'ID',
  base_currency text DEFAULT 'USD',
  custody_status text DEFAULT 'active' CHECK (custody_status IN ('active','restricted','suspended')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.custody_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read custody accounts" ON public.custody_accounts FOR SELECT TO authenticated USING (true);

-- PHASE 2: Segregated Client Asset Ledger
CREATE TABLE public.custody_ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custody_account_id uuid REFERENCES public.custody_accounts(id) ON DELETE CASCADE NOT NULL,
  asset_type text NOT NULL DEFAULT 'cash' CHECK (asset_type IN ('cash','property_unit','fund_unit')),
  debit_amount numeric DEFAULT 0,
  credit_amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  reference_transaction text,
  balance_snapshot numeric DEFAULT 0,
  entry_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.custody_ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read custody ledger" ON public.custody_ledger_entries FOR SELECT TO authenticated USING (true);

-- PHASE 3: Settlement Routing Profiles
CREATE TABLE public.settlement_routing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custody_account_id uuid REFERENCES public.custody_accounts(id) ON DELETE CASCADE NOT NULL,
  settlement_partner_code text,
  bank_account_reference text,
  swift_bic text,
  settlement_currency text DEFAULT 'USD',
  settlement_mode text DEFAULT 'domestic' CHECK (settlement_mode IN ('domestic','cross_border','instant')),
  active_flag boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.settlement_routing_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read settlement routing" ON public.settlement_routing_profiles FOR SELECT TO authenticated USING (true);

-- PHASE 4: SPV Entities
CREATE TABLE public.asset_spv_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id),
  jurisdiction_code text DEFAULT 'ID',
  legal_structure_type text DEFAULT 'PT_PMA',
  trustee_entity text,
  beneficial_owner_mapping jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.asset_spv_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read SPV entities" ON public.asset_spv_entities FOR SELECT TO authenticated USING (true);

-- SPV Investor Units
CREATE TABLE public.spv_investor_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id uuid REFERENCES public.asset_spv_entities(id) ON DELETE CASCADE NOT NULL,
  investor_user_id uuid REFERENCES auth.users(id) NOT NULL,
  ownership_percentage numeric DEFAULT 0,
  custody_account_id uuid REFERENCES public.custody_accounts(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.spv_investor_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors see own SPV units" ON public.spv_investor_units FOR SELECT TO authenticated USING (investor_user_id = auth.uid());

-- PHASE 5: Settlement Reconciliation
CREATE TABLE public.settlement_reconciliation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custody_account_id uuid REFERENCES public.custody_accounts(id) ON DELETE CASCADE NOT NULL,
  expected_balance numeric DEFAULT 0,
  actual_balance numeric DEFAULT 0,
  discrepancy_flag boolean DEFAULT false,
  reconciliation_date timestamptz DEFAULT now()
);
ALTER TABLE public.settlement_reconciliation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read reconciliation" ON public.settlement_reconciliation_records FOR SELECT TO authenticated USING (true);

-- PHASE 6: Regulatory Reporting Events
CREATE TABLE public.regulatory_reporting_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_code text DEFAULT 'ID',
  report_type text NOT NULL CHECK (report_type IN ('aml','capital_flow','investor_exposure','asset_transfer')),
  related_entity_id uuid,
  report_payload jsonb DEFAULT '{}',
  generated_at timestamptz DEFAULT now()
);
ALTER TABLE public.regulatory_reporting_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read regulatory reports" ON public.regulatory_reporting_events FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_custody_ledger_account ON public.custody_ledger_entries(custody_account_id);
CREATE INDEX idx_custody_ledger_created ON public.custody_ledger_entries(created_at DESC);
CREATE INDEX idx_settlement_routing_account ON public.settlement_routing_profiles(custody_account_id);
CREATE INDEX idx_spv_units_investor ON public.spv_investor_units(investor_user_id);
CREATE INDEX idx_reconciliation_date ON public.settlement_reconciliation_records(reconciliation_date DESC);
CREATE INDEX idx_regulatory_events_type ON public.regulatory_reporting_events(report_type);
