-- =============================================
-- EMAIL NOTIFICATIONS SYSTEM
-- =============================================

-- Email templates table for admin-customizable templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email logs for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  template_key TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- BOOKING SYSTEM
-- =============================================

-- Property bookings/viewings
CREATE TABLE IF NOT EXISTS public.property_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('viewing', 'rental', 'purchase_inquiry')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  notes TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  cancellation_reason TEXT,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- REVIEW & RATING SYSTEM
-- =============================================

-- Property reviews (new table)
CREATE TABLE IF NOT EXISTS public.property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.property_bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  is_verified_visit BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  admin_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  owner_response TEXT,
  owner_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, user_id)
);

-- Add missing columns to existing vendor_reviews table
ALTER TABLE public.vendor_reviews 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  ADD COLUMN IF NOT EXISTS professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  ADD COLUMN IF NOT EXISTS value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Review helpfulness votes
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_type TEXT NOT NULL CHECK (review_type IN ('property', 'vendor')),
  review_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_type, review_id, user_id)
);

-- Review reports for moderation
CREATE TABLE IF NOT EXISTS public.review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_type TEXT NOT NULL CHECK (review_type IN ('property', 'vendor')),
  review_id UUID NOT NULL,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ENABLE RLS
-- =============================================

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Email templates: Admin only
CREATE POLICY "Admins can manage email templates"
ON public.email_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Email logs: Users can see their own, admins can see all
CREATE POLICY "Users can view their own email logs"
ON public.email_logs FOR SELECT
USING (recipient_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Property bookings policies
CREATE POLICY "Users can view their own bookings"
ON public.property_bookings FOR SELECT
USING (user_id = auth.uid() OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create bookings"
ON public.property_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.property_bookings FOR UPDATE
USING (user_id = auth.uid() OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Property reviews policies
CREATE POLICY "Anyone can view published property reviews"
ON public.property_reviews FOR SELECT
USING (is_published = true AND admin_approved = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create property reviews"
ON public.property_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property reviews"
ON public.property_reviews FOR UPDATE
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own property reviews"
ON public.property_reviews FOR DELETE
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Review votes policies
CREATE POLICY "Anyone can view review votes"
ON public.review_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.review_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their votes"
ON public.review_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes"
ON public.review_votes FOR DELETE
USING (auth.uid() = user_id);

-- Review reports policies
CREATE POLICY "Users can view their own reports"
ON public.review_reports FOR SELECT
USING (reported_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can report reviews"
ON public.review_reports FOR INSERT
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can update reports"
ON public.review_reports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_property_bookings_property ON public.property_bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_user ON public.property_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_date ON public.property_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON public.property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_rating ON public.property_reviews(rating);

-- =============================================
-- INSERT DEFAULT EMAIL TEMPLATES
-- =============================================

INSERT INTO public.email_templates (template_key, template_name, subject, body_html, variables) VALUES
('booking_confirmation', 'Booking Confirmation', 'Your Property Viewing is Confirmed', 
 '<h1>Booking Confirmed!</h1><p>Hi {{user_name}},</p><p>Your viewing for <strong>{{property_title}}</strong> has been confirmed.</p><p><strong>Date:</strong> {{booking_date}}<br><strong>Time:</strong> {{booking_time}}</p><p>Address: {{property_address}}</p><p>Thank you for using our platform!</p>', 
 ARRAY['user_name', 'property_title', 'booking_date', 'booking_time', 'property_address']),
 
('booking_cancelled', 'Booking Cancelled', 'Your Property Viewing has been Cancelled',
 '<h1>Booking Cancelled</h1><p>Hi {{user_name}},</p><p>Your viewing for <strong>{{property_title}}</strong> scheduled on {{booking_date}} has been cancelled.</p><p>Reason: {{cancellation_reason}}</p><p>You can schedule a new viewing anytime.</p>',
 ARRAY['user_name', 'property_title', 'booking_date', 'cancellation_reason']),

('new_review', 'New Review Notification', 'You received a new review!',
 '<h1>New Review!</h1><p>Hi {{owner_name}},</p><p>{{reviewer_name}} left a {{rating}}-star review for <strong>{{property_title}}</strong>.</p><p>"{{review_text}}"</p><p>You can respond to this review from your dashboard.</p>',
 ARRAY['owner_name', 'reviewer_name', 'rating', 'property_title', 'review_text']),

('verification_approved', 'Verification Approved', 'Your Account has been Verified!',
 '<h1>Congratulations!</h1><p>Hi {{user_name}},</p><p>Your {{verification_type}} verification has been approved!</p><p>You now have access to all verified member benefits.</p>',
 ARRAY['user_name', 'verification_type']),

('vip_upgrade', 'VIP Upgrade Confirmation', 'Welcome to {{membership_level}}!',
 '<h1>Welcome to {{membership_level}}!</h1><p>Hi {{user_name}},</p><p>Your membership has been upgraded to <strong>{{membership_level}}</strong>.</p><p>Enjoy your new benefits:</p><ul>{{benefits_list}}</ul><p>Thank you for being a valued member!</p>',
 ARRAY['user_name', 'membership_level', 'benefits_list'])
ON CONFLICT (template_key) DO NOTHING;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_bookings_updated_at
  BEFORE UPDATE ON public.property_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_reviews_updated_at
  BEFORE UPDATE ON public.property_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();