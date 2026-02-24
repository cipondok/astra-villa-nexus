
-- Agent availability slots
CREATE TABLE public.agent_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Property visit bookings
CREATE TABLE public.property_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  visitor_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  visit_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  visitor_name TEXT,
  visitor_phone TEXT,
  visitor_email TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocked dates for agents (holidays, time off)
CREATE TABLE public.agent_blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, blocked_date)
);

-- Enable RLS
ALTER TABLE public.agent_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Agent availability policies
CREATE POLICY "Agents manage own availability" ON public.agent_availability
  FOR ALL TO authenticated
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Anyone can view agent availability" ON public.agent_availability
  FOR SELECT TO authenticated
  USING (is_available = true);

-- Property visits policies
CREATE POLICY "Visitors see own visits" ON public.property_visits
  FOR SELECT TO authenticated
  USING (visitor_id = auth.uid());

CREATE POLICY "Agents see visits assigned to them" ON public.property_visits
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "Authenticated users can book visits" ON public.property_visits
  FOR INSERT TO authenticated
  WITH CHECK (visitor_id = auth.uid());

CREATE POLICY "Agents can update their visits" ON public.property_visits
  FOR UPDATE TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "Visitors can cancel their visits" ON public.property_visits
  FOR UPDATE TO authenticated
  USING (visitor_id = auth.uid());

-- Blocked dates policies
CREATE POLICY "Agents manage own blocked dates" ON public.agent_blocked_dates
  FOR ALL TO authenticated
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Anyone can view blocked dates" ON public.agent_blocked_dates
  FOR SELECT TO authenticated
  USING (true);

-- Enable realtime for visit status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_visits;

-- Index for performance
CREATE INDEX idx_property_visits_visitor ON public.property_visits(visitor_id);
CREATE INDEX idx_property_visits_agent ON public.property_visits(agent_id);
CREATE INDEX idx_property_visits_date ON public.property_visits(visit_date);
CREATE INDEX idx_agent_availability_agent ON public.agent_availability(agent_id);
CREATE INDEX idx_agent_blocked_dates_agent ON public.agent_blocked_dates(agent_id, blocked_date);
