import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeEngine(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('custody-settlement-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useCustodyDashboard() {
  return useQuery({
    queryKey: ['custody-dashboard'],
    queryFn: () => invokeEngine('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useCustodyAccounts() {
  return useQuery({
    queryKey: ['custody-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custody_accounts' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCustodyLedger(accountId?: string) {
  return useQuery({
    queryKey: ['custody-ledger', accountId],
    queryFn: async () => {
      let q = supabase
        .from('custody_ledger_entries' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (accountId) q = q.eq('custody_account_id', accountId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useReconciliationRecords() {
  return useQuery({
    queryKey: ['custody-reconciliation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settlement_reconciliation_records' as any)
        .select('*')
        .order('reconciliation_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useRunReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { custody_account_id: string }) => invokeEngine('reconcile', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custody-reconciliation'] });
      qc.invalidateQueries({ queryKey: ['custody-dashboard'] });
      toast.success('Reconciliation completed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateCustodyAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('create_custody_account', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custody-accounts'] });
      qc.invalidateQueries({ queryKey: ['custody-dashboard'] });
      toast.success('Custody account created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRecordLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('record_ledger_entry', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custody-ledger'] });
      qc.invalidateQueries({ queryKey: ['custody-dashboard'] });
      toast.success('Ledger entry recorded');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
