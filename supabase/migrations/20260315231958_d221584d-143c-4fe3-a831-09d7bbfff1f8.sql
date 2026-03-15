-- Enhanced watchdog function replacing simple recover_stalled_jobs
-- Returns JSONB with full health diagnostics

CREATE OR REPLACE FUNCTION public.job_queue_watchdog()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stalled_reset integer := 0;
  v_stalled_failed integer := 0;
  v_pending_count integer;
  v_running_count integer;
  v_oldest_pending_age interval;
  v_failed_last_hour integer;
  v_completed_last_hour integer;
  v_health_status text;
  v_queue_delayed boolean := false;
BEGIN

  -- 1. Detect and handle stalled jobs (running > 15 minutes with no progress change)
  --    Jobs with retry_count < 3 → reset to pending
  --    Jobs with retry_count >= 3 → mark failed permanently
  
  -- Reset recoverable stalled jobs (retry_count < 3)
  WITH recoverable AS (
    UPDATE ai_jobs
    SET status = 'pending',
        started_at = NULL,
        error_message = 'Watchdog: reset stalled job (attempt ' || (COALESCE(
          (SELECT COUNT(*) FROM ai_job_logs WHERE job_id = ai_jobs.id AND message LIKE 'Watchdog:%'), 0
        ) + 1)::text || '/3)'
    WHERE status = 'running'
      AND started_at < now() - interval '15 minutes'
      AND COALESCE(
        (SELECT COUNT(*) FROM ai_job_logs WHERE job_id = ai_jobs.id AND message LIKE 'Watchdog: reset%'), 0
      ) < 3
    RETURNING id
  )
  SELECT count(*) INTO v_stalled_reset FROM recoverable;

  -- Fail permanently stalled jobs (already retried 3+ times by watchdog)
  WITH permanent_fail AS (
    UPDATE ai_jobs
    SET status = 'failed',
        completed_at = now(),
        error_message = 'Watchdog: permanently failed after 3 stall recoveries'
    WHERE status = 'running'
      AND started_at < now() - interval '15 minutes'
      AND COALESCE(
        (SELECT COUNT(*) FROM ai_job_logs WHERE job_id = ai_jobs.id AND message LIKE 'Watchdog: reset%'), 0
      ) >= 3
    RETURNING id
  )
  SELECT count(*) INTO v_stalled_failed FROM permanent_fail;

  -- Reset tasks from recovered jobs
  IF v_stalled_reset > 0 THEN
    UPDATE ai_job_tasks
    SET status = 'pending'
    WHERE status = 'running'
      AND job_id IN (
        SELECT id FROM ai_jobs WHERE status = 'pending' AND started_at IS NULL
      );
  END IF;

  -- 2. Queue statistics
  SELECT count(*) INTO v_pending_count FROM ai_jobs WHERE status = 'pending';
  SELECT count(*) INTO v_running_count FROM ai_jobs WHERE status = 'running';
  
  SELECT now() - min(created_at) INTO v_oldest_pending_age
  FROM ai_jobs WHERE status = 'pending';

  SELECT count(*) INTO v_failed_last_hour
  FROM ai_jobs WHERE status = 'failed' AND completed_at > now() - interval '1 hour';

  SELECT count(*) INTO v_completed_last_hour
  FROM ai_jobs WHERE status = 'completed' AND completed_at > now() - interval '1 hour';

  -- 3. Queue delay detection (pending > 10 minutes)
  v_queue_delayed := v_oldest_pending_age IS NOT NULL AND v_oldest_pending_age > interval '10 minutes';

  -- 4. Health classification
  IF v_stalled_failed > 0 OR v_failed_last_hour >= 5 OR (v_queue_delayed AND v_pending_count > 10) THEN
    v_health_status := 'critical';
  ELSIF v_stalled_reset > 0 OR v_failed_last_hour >= 2 OR v_queue_delayed THEN
    v_health_status := 'degraded';
  ELSE
    v_health_status := 'healthy';
  END IF;

  -- 5. Log watchdog results
  IF v_stalled_reset > 0 OR v_stalled_failed > 0 THEN
    INSERT INTO ai_job_logs (job_id, message, level)
    SELECT id, 
      CASE 
        WHEN status = 'pending' THEN 'Watchdog: reset stalled job for retry'
        WHEN status = 'failed' THEN 'Watchdog: permanently failed after max retries'
        ELSE 'Watchdog: processed'
      END,
      CASE WHEN status = 'failed' THEN 'error' ELSE 'warning' END
    FROM ai_jobs 
    WHERE (status = 'pending' AND started_at IS NULL AND error_message LIKE 'Watchdog:%')
       OR (status = 'failed' AND error_message = 'Watchdog: permanently failed after 3 stall recoveries' AND completed_at > now() - interval '1 minute');
  END IF;

  RETURN jsonb_build_object(
    'health_status', v_health_status,
    'stalled_reset', v_stalled_reset,
    'stalled_failed', v_stalled_failed,
    'pending_count', v_pending_count,
    'running_count', v_running_count,
    'failed_last_hour', v_failed_last_hour,
    'completed_last_hour', v_completed_last_hour,
    'queue_delayed', v_queue_delayed,
    'oldest_pending_age_seconds', COALESCE(EXTRACT(EPOCH FROM v_oldest_pending_age)::integer, 0),
    'checked_at', now()
  );
END;
$$;

-- Also update recover_stalled_jobs to use the new 15-minute threshold
CREATE OR REPLACE FUNCTION public.recover_stalled_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recovered integer;
BEGIN
  WITH stalled AS (
    UPDATE ai_jobs
    SET status = 'pending', started_at = NULL
    WHERE status = 'running'
      AND started_at < now() - interval '15 minutes'
    RETURNING id
  )
  SELECT count(*) INTO recovered FROM stalled;

  UPDATE ai_job_tasks
  SET status = 'pending'
  WHERE status = 'running'
    AND job_id IN (
      SELECT id FROM ai_jobs WHERE status = 'pending' AND started_at IS NULL
    );

  RETURN recovered;
END;
$$;