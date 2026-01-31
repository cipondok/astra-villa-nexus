-- Insert test video verification sessions for admin review testing
INSERT INTO public.video_verification_sessions (
  user_id,
  status,
  scheduled_at,
  verification_type,
  consent_given,
  recording_consent,
  notes,
  fraud_flags
) VALUES 
  -- Pending review session
  (
    'ba91fae1-32df-4356-adf3-170c2d98c681',
    'pending_review',
    NOW() + INTERVAL '1 day',
    'level_4',
    true,
    true,
    'Test session for Level 4 premium verification',
    '[]'::jsonb
  ),
  -- Scheduled session
  (
    'ba91fae1-32df-4356-adf3-170c2d98c681',
    'scheduled',
    NOW() + INTERVAL '3 days',
    'premium',
    false,
    false,
    'Upcoming premium verification call',
    '[]'::jsonb
  ),
  -- In progress session
  (
    'ba91fae1-32df-4356-adf3-170c2d98c681',
    'in_progress',
    NOW() - INTERVAL '1 hour',
    'property_owner',
    true,
    true,
    'Property owner verification in progress',
    '["suspicious_document"]'::jsonb
  );