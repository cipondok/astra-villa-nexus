-- Create RPC wrappers for pgmq operations
CREATE OR REPLACE FUNCTION public.pgmq_read(queue_name text, vt integer, qty integer)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row record;
BEGIN
  FOR row IN SELECT * FROM pgmq.read(queue_name, vt, qty)
  LOOP
    RETURN NEXT jsonb_build_object(
      'msg_id', row.msg_id,
      'read_ct', row.read_ct,
      'enqueued_at', row.enqueued_at,
      'vt', row.vt,
      'message', row.message
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.pgmq_archive(queue_name text, msg_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN pgmq.archive(queue_name, msg_id);
END;
$$;

-- Grant to service_role only (dispatcher runs as service_role)
GRANT EXECUTE ON FUNCTION public.pgmq_read(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.pgmq_archive(text, bigint) TO service_role;