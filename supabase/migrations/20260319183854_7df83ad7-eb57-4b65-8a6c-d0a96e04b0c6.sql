CREATE OR REPLACE FUNCTION get_email_log_stats(
  p_start timestamptz DEFAULT now() - interval '7 days',
  p_end timestamptz DEFAULT now(),
  p_template text DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS TABLE(
  total_count bigint,
  sent_count bigint,
  failed_count bigint,
  suppressed_count bigint,
  pending_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*)::bigint AS total_count,
    count(*) FILTER (WHERE status = 'sent')::bigint AS sent_count,
    count(*) FILTER (WHERE status = 'dlq' OR status = 'failed')::bigint AS failed_count,
    count(*) FILTER (WHERE status = 'suppressed')::bigint AS suppressed_count,
    count(*) FILTER (WHERE status = 'pending')::bigint AS pending_count
  FROM (
    SELECT DISTINCT ON (message_id) status, created_at, template_name
    FROM email_send_log
    WHERE message_id IS NOT NULL
    ORDER BY message_id, created_at DESC
  ) latest
  WHERE created_at >= p_start AND created_at <= p_end
    AND (p_template IS NULL OR template_name = p_template)
    AND (p_status IS NULL OR status = p_status);
$$;

CREATE OR REPLACE FUNCTION get_email_log_entries(
  p_start timestamptz DEFAULT now() - interval '7 days',
  p_end timestamptz DEFAULT now(),
  p_template text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  message_id text,
  template_name text,
  recipient_email text,
  status text,
  error_message text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, message_id, template_name, recipient_email, status, error_message, created_at
  FROM (
    SELECT DISTINCT ON (message_id) id, message_id, template_name, recipient_email, status, error_message, created_at
    FROM email_send_log
    WHERE message_id IS NOT NULL
    ORDER BY message_id, created_at DESC
  ) latest
  WHERE created_at >= p_start AND created_at <= p_end
    AND (p_template IS NULL OR template_name = p_template)
    AND (p_status IS NULL OR status = p_status)
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

CREATE OR REPLACE FUNCTION get_email_template_names()
RETURNS TABLE(template_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT template_name FROM email_send_log ORDER BY template_name;
$$;