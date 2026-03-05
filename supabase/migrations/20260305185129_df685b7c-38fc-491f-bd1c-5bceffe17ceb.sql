-- Function to list all cron jobs
CREATE OR REPLACE FUNCTION public.get_cron_jobs()
RETURNS TABLE(
  jobid bigint,
  schedule text,
  command text,
  jobname text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jobid, schedule, command, jobname, nodename, nodeport, database, username, active
  FROM cron.job
  ORDER BY jobid;
$$;

-- Function to get recent cron job run details
CREATE OR REPLACE FUNCTION public.get_cron_job_runs(p_limit integer DEFAULT 50)
RETURNS TABLE(
  runid bigint,
  jobid bigint,
  job_pid integer,
  status text,
  return_message text,
  start_time timestamptz,
  end_time timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT runid, jobid, job_pid, status, return_message, start_time, end_time
  FROM cron.job_run_details
  ORDER BY start_time DESC
  LIMIT p_limit;
$$;