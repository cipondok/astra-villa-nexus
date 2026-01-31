-- Video Verification Sessions Table
CREATE TABLE public.video_verification_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'failed', 'pending_review')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    calendly_event_id TEXT,
    calendly_event_uri TEXT,
    meeting_url TEXT,
    room_id TEXT UNIQUE,
    verification_type TEXT NOT NULL DEFAULT 'level_4' CHECK (verification_type IN ('level_4', 'premium', 'property_owner', 'agent_license')),
    consent_given BOOLEAN DEFAULT FALSE,
    recording_consent BOOLEAN DEFAULT FALSE,
    recording_url TEXT,
    recording_encrypted BOOLEAN DEFAULT FALSE,
    notes TEXT,
    fraud_flags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Session Documents (uploaded during call)
CREATE TABLE public.video_session_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.video_verification_sessions(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('government_id', 'property_document', 'proof_of_ownership', 'agency_license', 'selfie', 'other')),
    document_url TEXT NOT NULL,
    document_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_review')),
    ocr_data JSONB,
    verification_notes TEXT,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Verification Reviews (admin review)
CREATE TABLE public.video_verification_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.video_verification_sessions(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs_more_info', 'escalated')),
    trust_score_awarded INTEGER CHECK (trust_score_awarded >= 0 AND trust_score_awarded <= 100),
    badge_tier_awarded TEXT CHECK (badge_tier_awarded IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    fraud_detected BOOLEAN DEFAULT FALSE,
    fraud_indicators JSONB DEFAULT '[]'::jsonb,
    review_notes TEXT,
    identity_match_score NUMERIC(5,2),
    document_authenticity_score NUMERIC(5,2),
    liveness_score NUMERIC(5,2),
    overall_confidence NUMERIC(5,2),
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Call Participants (for WebRTC signaling)
CREATE TABLE public.video_call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.video_verification_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('applicant', 'agent', 'observer')),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    connection_quality TEXT,
    device_info JSONB,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fraud Detection Logs
CREATE TABLE public.video_fraud_detection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.video_verification_sessions(id) ON DELETE CASCADE NOT NULL,
    detection_type TEXT NOT NULL CHECK (detection_type IN ('face_mismatch', 'document_tampering', 'liveness_failure', 'suspicious_behavior', 'duplicate_document', 'blacklisted_user', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence_score NUMERIC(5,2),
    details JSONB,
    flagged_by TEXT CHECK (flagged_by IN ('system', 'agent', 'ai')),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.video_verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_session_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_verification_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_fraud_detection_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_verification_sessions
CREATE POLICY "Users can view own sessions" ON public.video_verification_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.video_verification_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents can view assigned sessions" ON public.video_verification_sessions
    FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Admins can manage all sessions" ON public.video_verification_sessions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for video_session_documents
CREATE POLICY "Users can view own session documents" ON public.video_session_documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.video_verification_sessions 
                WHERE id = session_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can upload documents to own sessions" ON public.video_session_documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.video_verification_sessions 
                WHERE id = session_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all documents" ON public.video_session_documents
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for video_verification_reviews
CREATE POLICY "Users can view reviews of own sessions" ON public.video_verification_reviews
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.video_verification_sessions 
                WHERE id = session_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can manage reviews" ON public.video_verification_reviews
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for video_call_participants
CREATE POLICY "Participants can view own entry" ON public.video_call_participants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Session participants can view each other" ON public.video_call_participants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.video_call_participants p2
                WHERE p2.session_id = session_id AND p2.user_id = auth.uid())
    );

CREATE POLICY "Users can join sessions" ON public.video_call_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage participants" ON public.video_call_participants
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for fraud logs
CREATE POLICY "Admins can view fraud logs" ON public.video_fraud_detection_logs
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage fraud logs" ON public.video_fraud_detection_logs
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_video_sessions_user ON public.video_verification_sessions(user_id);
CREATE INDEX idx_video_sessions_status ON public.video_verification_sessions(status);
CREATE INDEX idx_video_sessions_scheduled ON public.video_verification_sessions(scheduled_at);
CREATE INDEX idx_video_documents_session ON public.video_session_documents(session_id);
CREATE INDEX idx_video_reviews_session ON public.video_verification_reviews(session_id);
CREATE INDEX idx_video_participants_session ON public.video_call_participants(session_id);
CREATE INDEX idx_fraud_logs_session ON public.video_fraud_detection_logs(session_id);
CREATE INDEX idx_fraud_logs_severity ON public.video_fraud_detection_logs(severity);

-- Trigger for updated_at
CREATE TRIGGER update_video_sessions_updated_at
    BEFORE UPDATE ON public.video_verification_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();