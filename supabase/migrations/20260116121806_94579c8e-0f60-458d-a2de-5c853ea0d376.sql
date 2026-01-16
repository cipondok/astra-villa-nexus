-- Fix security issues

-- 1. Drop the security definer view and recreate as regular view
DROP VIEW IF EXISTS public.transaction_summary;

CREATE VIEW public.transaction_summary WITH (security_invoker = true) AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  transaction_type,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
  SUM(base_amount) as total_base_amount,
  SUM(total_tax) as total_tax_collected,
  SUM(service_charges) as total_service_charges,
  SUM(total_amount) as total_revenue
FROM public.unified_transactions
GROUP BY DATE_TRUNC('day', created_at), transaction_type;

-- 2. Fix function search paths (already fixed in original but let's ensure)
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  sequence_num INT;
  result TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 11) AS INT)), 0) + 1
  INTO sequence_num
  FROM unified_transactions
  WHERE transaction_number LIKE 'TRX' || TO_CHAR(NOW(), 'YYMMDD') || '%';
  
  result := 'TRX' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(sequence_num::TEXT, 4, '0');
  RETURN result;
END;
$$;

-- 3. Fix overly permissive RLS policies for feedback insert
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.user_feedback;
CREATE POLICY "Authenticated users can submit feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));