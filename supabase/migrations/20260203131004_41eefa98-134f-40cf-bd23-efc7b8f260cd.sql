
-- Automation Workflows Configuration
CREATE TABLE public.automation_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  workflow_type TEXT NOT NULL, -- onboarding, listing_processing, messaging, reports, partner_management
  description TEXT,
  trigger_type TEXT NOT NULL, -- scheduled, event, webhook, manual
  trigger_config JSONB DEFAULT '{}',
  -- Execution
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,
  max_concurrent INTEGER DEFAULT 10,
  retry_attempts INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 300,
  -- Integration
  zapier_webhook_url TEXT,
  custom_bot_id TEXT,
  ai_moderation_enabled BOOLEAN DEFAULT false,
  -- Metrics
  total_executions BIGINT DEFAULT 0,
  successful_executions BIGINT DEFAULT 0,
  failed_executions BIGINT DEFAULT 0,
  avg_execution_time_ms INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  -- Meta
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Automation Task Queue
CREATE TABLE public.automation_task_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 5,
  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  -- Timing
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER,
  -- Results
  result JSONB DEFAULT '{}',
  error_message TEXT,
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Automation
CREATE TABLE public.onboarding_automation_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_type TEXT NOT NULL, -- buyer, seller, agent, landlord, renter
  -- Welcome sequence
  welcome_email_template_id TEXT,
  welcome_sms_template_id TEXT,
  welcome_whatsapp_template_id TEXT,
  -- Onboarding steps
  onboarding_steps JSONB DEFAULT '[]',
  required_verifications TEXT[] DEFAULT '{}',
  auto_assign_rewards BOOLEAN DEFAULT true,
  reward_tokens INTEGER DEFAULT 100,
  -- Follow-up
  follow_up_sequence JSONB DEFAULT '[]',
  reminder_intervals INTEGER[] DEFAULT ARRAY[1, 3, 7], -- days
  -- AI
  ai_personalization_enabled BOOLEAN DEFAULT true,
  ai_recommendation_model TEXT DEFAULT 'property_match_v1',
  -- Stats
  total_onboarded INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_time_to_complete_hours INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(persona_type)
);

-- Listing Processing Automation
CREATE TABLE public.listing_automation_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_type TEXT NOT NULL,
  -- Validation
  auto_validate BOOLEAN DEFAULT true,
  validation_rules JSONB DEFAULT '{}',
  required_fields TEXT[] DEFAULT '{}',
  required_images INTEGER DEFAULT 5,
  -- AI Enhancement
  ai_description_enhancement BOOLEAN DEFAULT true,
  ai_price_suggestion BOOLEAN DEFAULT true,
  ai_photo_scoring BOOLEAN DEFAULT true,
  ai_duplicate_detection BOOLEAN DEFAULT true,
  -- Syndication
  auto_syndicate BOOLEAN DEFAULT true,
  syndication_networks TEXT[] DEFAULT '{}',
  syndication_delay_hours INTEGER DEFAULT 0,
  -- Moderation
  auto_approve_threshold DECIMAL(3,2) DEFAULT 0.85,
  manual_review_threshold DECIMAL(3,2) DEFAULT 0.50,
  -- Stats
  total_processed INTEGER DEFAULT 0,
  auto_approved INTEGER DEFAULT 0,
  manual_review INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Message Automation (AI Moderation)
CREATE TABLE public.message_automation_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_type TEXT NOT NULL, -- chat, whatsapp, email, inquiry
  -- Auto-response
  auto_response_enabled BOOLEAN DEFAULT true,
  auto_response_delay_seconds INTEGER DEFAULT 5,
  response_templates JSONB DEFAULT '[]',
  -- AI
  ai_intent_detection BOOLEAN DEFAULT true,
  ai_sentiment_analysis BOOLEAN DEFAULT true,
  ai_language_detection BOOLEAN DEFAULT true,
  ai_auto_translation BOOLEAN DEFAULT false,
  ai_spam_detection BOOLEAN DEFAULT true,
  ai_escalation_enabled BOOLEAN DEFAULT true,
  -- Routing
  routing_rules JSONB DEFAULT '{}',
  escalation_keywords TEXT[] DEFAULT '{}',
  priority_keywords TEXT[] DEFAULT '{}',
  -- Stats
  total_messages INTEGER DEFAULT 0,
  auto_responded INTEGER DEFAULT 0,
  escalated INTEGER DEFAULT 0,
  spam_blocked INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel_type)
);

-- Report Generation Automation
CREATE TABLE public.report_automation_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL, -- market_analysis, price_trends, demand_supply, neighborhood, investment
  report_name TEXT NOT NULL,
  description TEXT,
  -- Schedule
  is_scheduled BOOLEAN DEFAULT true,
  schedule_cron TEXT DEFAULT '0 6 * * *', -- daily at 6am
  timezone TEXT DEFAULT 'Asia/Jakarta',
  -- Parameters
  default_parameters JSONB DEFAULT '{}',
  available_regions TEXT[] DEFAULT '{}',
  available_property_types TEXT[] DEFAULT '{}',
  -- AI
  ai_insights_enabled BOOLEAN DEFAULT true,
  ai_predictions_enabled BOOLEAN DEFAULT true,
  ai_recommendations_enabled BOOLEAN DEFAULT true,
  -- Distribution
  auto_distribute BOOLEAN DEFAULT true,
  distribution_channels TEXT[] DEFAULT ARRAY['email', 'dashboard'],
  subscriber_tiers TEXT[] DEFAULT ARRAY['pro', 'enterprise'],
  -- Stats
  total_generated INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  avg_generation_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Partner Automation
CREATE TABLE public.partner_automation_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_type TEXT NOT NULL, -- bank, agent, developer, vendor, affiliate
  -- Communication
  auto_welcome BOOLEAN DEFAULT true,
  welcome_template_id TEXT,
  regular_update_frequency TEXT DEFAULT 'weekly',
  update_template_id TEXT,
  -- Performance tracking
  auto_performance_reports BOOLEAN DEFAULT true,
  performance_report_frequency TEXT DEFAULT 'monthly',
  kpi_thresholds JSONB DEFAULT '{}',
  -- Renewals
  auto_renewal_reminder BOOLEAN DEFAULT true,
  renewal_reminder_days INTEGER[] DEFAULT ARRAY[30, 14, 7],
  -- Payouts
  auto_commission_calculation BOOLEAN DEFAULT true,
  auto_payout_enabled BOOLEAN DEFAULT false,
  payout_schedule TEXT DEFAULT 'monthly',
  minimum_payout_amount DECIMAL(15,2) DEFAULT 500000,
  -- Stats
  total_partners INTEGER DEFAULT 0,
  active_partners INTEGER DEFAULT 0,
  total_commissions_paid DECIMAL(18,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner_type)
);

-- Zapier Integration Logs
CREATE TABLE public.zapier_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.automation_workflows(id),
  webhook_url TEXT NOT NULL,
  request_payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  execution_time_ms INTEGER,
  is_success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom Bot Configuration
CREATE TABLE public.automation_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_name TEXT NOT NULL,
  bot_type TEXT NOT NULL, -- onboarding, support, sales, moderation, reporting
  description TEXT,
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  ai_model TEXT DEFAULT 'gpt-4',
  system_prompt TEXT,
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  -- Capabilities
  capabilities TEXT[] DEFAULT '{}',
  allowed_actions TEXT[] DEFAULT '{}',
  restricted_actions TEXT[] DEFAULT '{}',
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  -- Stats
  total_interactions BIGINT DEFAULT 0,
  successful_interactions BIGINT DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  user_satisfaction_avg DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Automation Metrics (Time-series)
CREATE TABLE public.automation_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE NOT NULL,
  metric_hour INTEGER DEFAULT 0,
  -- Volume metrics
  users_onboarded INTEGER DEFAULT 0,
  listings_processed INTEGER DEFAULT 0,
  messages_handled INTEGER DEFAULT 0,
  reports_generated INTEGER DEFAULT 0,
  partner_actions INTEGER DEFAULT 0,
  -- Performance metrics
  avg_onboarding_time_minutes INTEGER DEFAULT 0,
  avg_listing_process_time_seconds INTEGER DEFAULT 0,
  avg_message_response_time_seconds INTEGER DEFAULT 0,
  avg_report_generation_time_seconds INTEGER DEFAULT 0,
  -- Quality metrics
  onboarding_completion_rate DECIMAL(5,2) DEFAULT 0,
  listing_approval_rate DECIMAL(5,2) DEFAULT 0,
  message_resolution_rate DECIMAL(5,2) DEFAULT 0,
  partner_satisfaction_rate DECIMAL(5,2) DEFAULT 0,
  -- Error metrics
  failed_tasks INTEGER DEFAULT 0,
  zapier_errors INTEGER DEFAULT 0,
  ai_errors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_date, metric_hour)
);

-- Enable RLS
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_task_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_automation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_automation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_automation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_automation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_automation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zapier_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only)
CREATE POLICY "Admins can manage workflows" ON public.automation_workflows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage task queue" ON public.automation_task_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage onboarding config" ON public.onboarding_automation_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage listing config" ON public.listing_automation_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage message config" ON public.message_automation_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage report config" ON public.report_automation_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage partner config" ON public.partner_automation_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view webhook logs" ON public.zapier_webhook_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage bots" ON public.automation_bots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view metrics" ON public.automation_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Seed default configurations
INSERT INTO public.onboarding_automation_config (persona_type, reward_tokens, onboarding_steps) VALUES
('buyer', 100, '[{"step": 1, "action": "welcome_email"}, {"step": 2, "action": "preference_setup"}, {"step": 3, "action": "first_search"}]'),
('seller', 150, '[{"step": 1, "action": "welcome_email"}, {"step": 2, "action": "property_listing"}, {"step": 3, "action": "verification"}]'),
('agent', 200, '[{"step": 1, "action": "welcome_email"}, {"step": 2, "action": "license_verification"}, {"step": 3, "action": "dashboard_tour"}]'),
('landlord', 150, '[{"step": 1, "action": "welcome_email"}, {"step": 2, "action": "property_setup"}, {"step": 3, "action": "tenant_matching"}]'),
('renter', 100, '[{"step": 1, "action": "welcome_email"}, {"step": 2, "action": "preference_setup"}, {"step": 3, "action": "recommendations"}]');

INSERT INTO public.message_automation_config (channel_type, auto_response_enabled, ai_intent_detection) VALUES
('chat', true, true),
('whatsapp', true, true),
('email', true, true),
('inquiry', true, true);

INSERT INTO public.partner_automation_config (partner_type, auto_welcome, auto_performance_reports) VALUES
('bank', true, true),
('agent', true, true),
('developer', true, true),
('vendor', true, true),
('affiliate', true, true);

INSERT INTO public.report_automation_config (report_type, report_name, schedule_cron, available_regions) VALUES
('market_analysis', 'Daily Market Analysis', '0 6 * * *', ARRAY['Jakarta', 'Bali', 'Surabaya', 'Bandung']),
('price_trends', 'Weekly Price Trends', '0 7 * * 1', ARRAY['Jakarta', 'Bali', 'Surabaya', 'Bandung']),
('demand_supply', 'Demand-Supply Report', '0 8 * * *', ARRAY['All Indonesia']),
('neighborhood', 'Neighborhood Insights', '0 9 1 * *', ARRAY['Jakarta', 'Bali']),
('investment', 'Investment Opportunities', '0 10 * * 1', ARRAY['All Indonesia']);

INSERT INTO public.automation_bots (bot_name, bot_type, description, capabilities) VALUES
('OnboardingBot', 'onboarding', 'Guides new users through registration and setup', ARRAY['welcome', 'guide', 'answer_faq', 'collect_preferences']),
('SupportBot', 'support', 'Handles common support inquiries and escalates complex issues', ARRAY['answer_faq', 'troubleshoot', 'escalate', 'ticket_create']),
('SalesBot', 'sales', 'Assists with property inquiries and viewing bookings', ARRAY['property_info', 'schedule_viewing', 'price_negotiation', 'lead_qualify']),
('ModerationBot', 'moderation', 'Reviews and moderates user content and listings', ARRAY['content_review', 'spam_detection', 'flag_content', 'auto_approve']),
('ReportBot', 'reporting', 'Generates and distributes automated reports', ARRAY['generate_report', 'analyze_data', 'send_notification', 'schedule_delivery']);

-- Create indexes
CREATE INDEX idx_task_queue_status ON public.automation_task_queue(status);
CREATE INDEX idx_task_queue_scheduled ON public.automation_task_queue(scheduled_at);
CREATE INDEX idx_task_queue_workflow ON public.automation_task_queue(workflow_id);
CREATE INDEX idx_zapier_logs_workflow ON public.zapier_webhook_logs(workflow_id);
CREATE INDEX idx_zapier_logs_created ON public.zapier_webhook_logs(created_at);
CREATE INDEX idx_metrics_date ON public.automation_metrics(metric_date);
