
-- Create vendor AI verification table
CREATE TABLE public.vendor_ai_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL, -- 'individual', 'company'
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  biometric_verification JSONB DEFAULT '{}', -- Face recognition results
  document_verification JSONB DEFAULT '{}', -- ID/license validation
  financial_health_score INTEGER DEFAULT 0 CHECK (financial_health_score >= 0 AND financial_health_score <= 100),
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'flagged'
  ai_confidence_score NUMERIC(5,2) DEFAULT 0.00,
  verification_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create dynamic service categories with AI tagging
CREATE TABLE public.vendor_service_categories_ai (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL,
  parent_category_id UUID REFERENCES public.vendor_service_categories_ai(id),
  ai_keywords JSONB DEFAULT '[]', -- Auto-extracted keywords
  classification_confidence NUMERIC(5,2) DEFAULT 0.00,
  is_hybrid BOOLEAN DEFAULT false,
  nlp_tags JSONB DEFAULT '[]', -- NLP-generated tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AI matching scores and recommendations
CREATE TABLE public.vendor_ai_matching (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL, -- Links to user request
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  matching_score NUMERIC(5,2) DEFAULT 0.00,
  proximity_score INTEGER DEFAULT 0,
  experience_score INTEGER DEFAULT 0,
  rating_score INTEGER DEFAULT 0,
  availability_score INTEGER DEFAULT 0,
  specialization_match NUMERIC(5,2) DEFAULT 0.00,
  explanation TEXT, -- AI-generated explanation
  recommendation_rank INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fraud detection logs
CREATE TABLE public.vendor_fraud_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  detection_type TEXT NOT NULL, -- 'fake_reviews', 'payment_fraud', 'profile_anomaly'
  fraud_probability NUMERIC(5,2) DEFAULT 0.00,
  risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  detection_details JSONB DEFAULT '{}',
  model_version TEXT,
  action_taken TEXT, -- 'flagged', 'suspended', 'investigated', 'cleared'
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendor performance analytics
CREATE TABLE public.vendor_performance_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  response_time_avg INTEGER DEFAULT 0, -- in minutes
  customer_satisfaction NUMERIC(3,2) DEFAULT 0.00,
  completion_rate NUMERIC(5,2) DEFAULT 0.00,
  booking_count INTEGER DEFAULT 0,
  revenue_generated NUMERIC(15,2) DEFAULT 0.00,
  rating_trend NUMERIC(3,2) DEFAULT 0.00,
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  ai_insights JSONB DEFAULT '{}',
  alerts_generated JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendor AI insights and alerts
CREATE TABLE public.vendor_ai_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'performance_drop', 'fraud_risk', 'opportunity', 'maintenance'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  alert_message TEXT NOT NULL,
  ai_recommendation TEXT,
  action_required BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for vendor AI tables
ALTER TABLE public.vendor_ai_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_service_categories_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ai_matching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_fraud_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ai_alerts ENABLE ROW LEVEL SECURITY;

-- Vendor AI verification policies
CREATE POLICY "Vendors can view their own AI verification" 
  ON public.vendor_ai_verification 
  FOR SELECT 
  USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage AI verification" 
  ON public.vendor_ai_verification 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Service categories AI policies (public read, admin write)
CREATE POLICY "Anyone can view AI service categories" 
  ON public.vendor_service_categories_ai 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage AI service categories" 
  ON public.vendor_service_categories_ai 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- AI matching policies
CREATE POLICY "Users can view their matching results" 
  ON public.vendor_ai_matching 
  FOR SELECT 
  USING (true); -- Open for matching algorithm

CREATE POLICY "Admins can manage AI matching" 
  ON public.vendor_ai_matching 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Fraud detection policies (admin only)
CREATE POLICY "Admins can manage fraud detection" 
  ON public.vendor_fraud_detection 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Performance analytics policies
CREATE POLICY "Vendors can view their own analytics" 
  ON public.vendor_performance_analytics 
  FOR SELECT 
  USING (vendor_id = auth.uid());

CREATE POLICY "Admins can view all analytics" 
  ON public.vendor_performance_analytics 
  FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- AI alerts policies
CREATE POLICY "Vendors can view their own alerts" 
  ON public.vendor_ai_alerts 
  FOR SELECT 
  USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all alerts" 
  ON public.vendor_ai_alerts 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX idx_vendor_ai_verification_vendor_id ON public.vendor_ai_verification(vendor_id);
CREATE INDEX idx_vendor_ai_verification_trust_score ON public.vendor_ai_verification(trust_score);
CREATE INDEX idx_vendor_ai_matching_vendor_id ON public.vendor_ai_matching(vendor_id);
CREATE INDEX idx_vendor_ai_matching_score ON public.vendor_ai_matching(matching_score);
CREATE INDEX idx_vendor_fraud_detection_vendor_id ON public.vendor_fraud_detection(vendor_id);
CREATE INDEX idx_vendor_fraud_detection_risk_level ON public.vendor_fraud_detection(risk_level);
CREATE INDEX idx_vendor_performance_analytics_vendor_id ON public.vendor_performance_analytics(vendor_id);
CREATE INDEX idx_vendor_performance_analytics_date ON public.vendor_performance_analytics(metric_date);
CREATE INDEX idx_vendor_ai_alerts_vendor_id ON public.vendor_ai_alerts(vendor_id);
CREATE INDEX idx_vendor_ai_alerts_severity ON public.vendor_ai_alerts(severity);
