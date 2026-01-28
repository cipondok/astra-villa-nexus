import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PayoutSettings {
  id: string;
  user_id: string;
  bank_name: string;
  bank_code: string | null;
  account_number: string;
  account_holder_name: string;
  is_verified: boolean;
  verified_at: string | null;
  payout_schedule: 'instant' | 'daily' | 'weekly' | 'monthly';
  minimum_payout: number;
  auto_payout_enabled: boolean;
  tax_id: string | null;
}

export interface Commission {
  id: string;
  transaction_id: string;
  transaction_type: string;
  seller_id: string;
  buyer_id: string | null;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  tax_amount: number;
  status: 'pending' | 'held' | 'released' | 'paid' | 'refunded';
  hold_until: string | null;
  released_at: string | null;
  payout_id: string | null;
  created_at: string;
}

export interface Payout {
  id: string;
  payout_reference: string;
  vendor_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  commission_ids: string[];
  failure_reason: string | null;
  processed_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  dispute_reference: string;
  transaction_id: string;
  raised_by: string;
  against_user: string | null;
  dispute_type: 'refund_request' | 'service_not_delivered' | 'quality_issue' | 'fraudulent' | 'other';
  dispute_reason: string;
  evidence: any[];
  amount: number;
  status: 'open' | 'under_review' | 'resolved_buyer_favor' | 'resolved_seller_favor' | 'escalated' | 'closed';
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
}

// Indonesian Bank List
export const INDONESIAN_BANKS = [
  { code: 'bca', name: 'Bank Central Asia (BCA)' },
  { code: 'bni', name: 'Bank Negara Indonesia (BNI)' },
  { code: 'bri', name: 'Bank Rakyat Indonesia (BRI)' },
  { code: 'mandiri', name: 'Bank Mandiri' },
  { code: 'cimb', name: 'CIMB Niaga' },
  { code: 'danamon', name: 'Bank Danamon' },
  { code: 'permata', name: 'Bank Permata' },
  { code: 'maybank', name: 'Maybank Indonesia' },
  { code: 'panin', name: 'Bank Panin' },
  { code: 'ocbc', name: 'OCBC NISP' },
  { code: 'btn', name: 'Bank BTN' },
  { code: 'bsi', name: 'Bank Syariah Indonesia (BSI)' },
  { code: 'jago', name: 'Bank Jago' },
  { code: 'jenius', name: 'Jenius (BTPN)' },
  { code: 'seabank', name: 'SeaBank' },
  { code: 'gopay', name: 'GoPay' },
  { code: 'ovo', name: 'OVO' },
  { code: 'dana', name: 'DANA' }
];

export function usePayoutSystem() {
  const { user } = useAuth();
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  // Fetch payout settings
  const fetchPayoutSettings = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('vendor_payout_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching payout settings:', error);
    }

    setPayoutSettings(data as PayoutSettings | null);
  }, [user]);

  // Fetch commissions
  const fetchCommissions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transaction_commissions')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching commissions:', error);
      return;
    }

    setCommissions((data || []) as Commission[]);

    // Calculate balances
    const available = data?.filter(c => c.status === 'released').reduce((sum, c) => sum + Number(c.net_amount), 0) || 0;
    const pending = data?.filter(c => c.status === 'pending' || c.status === 'held').reduce((sum, c) => sum + Number(c.net_amount), 0) || 0;
    
    setAvailableBalance(available);
    setPendingBalance(pending);
  }, [user]);

  // Fetch payouts
  const fetchPayouts = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('vendor_payouts')
      .select('*')
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payouts:', error);
      return;
    }

    setPayouts((data || []) as Payout[]);
  }, [user]);

  // Fetch disputes
  const fetchDisputes = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('payment_disputes')
      .select('*')
      .or(`raised_by.eq.${user.id},against_user.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching disputes:', error);
      return;
    }

    setDisputes((data || []) as Dispute[]);
  }, [user]);

  // Save payout settings
  const savePayoutSettings = useCallback(async (settings: Partial<PayoutSettings>) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { bank_name, bank_code, account_number, account_holder_name, minimum_payout, auto_payout_enabled, tax_id } = settings;
      
      const { data, error } = await supabase
        .from('vendor_payout_settings')
        .upsert({
          user_id: user.id,
          bank_name: bank_name || '',
          bank_code,
          account_number: account_number || '',
          account_holder_name: account_holder_name || '',
          minimum_payout,
          auto_payout_enabled,
          tax_id
        })
        .select()
        .single();

      if (error) throw error;

      setPayoutSettings(data as PayoutSettings);
      toast.success('Payout settings saved');
      return { success: true, data };
    } catch (err: any) {
      console.error('Error saving payout settings:', err);
      toast.error('Failed to save payout settings');
      return { success: false, error: err.message };
    }
  }, [user]);

  // Request manual payout
  const requestPayout = useCallback(async (amount?: number) => {
    if (!user || !payoutSettings) {
      toast.error('Please set up payout settings first');
      return { success: false, error: 'Payout settings not configured' };
    }

    const payoutAmount = amount || availableBalance;
    
    if (payoutAmount < payoutSettings.minimum_payout) {
      toast.error(`Minimum payout is Rp ${payoutSettings.minimum_payout.toLocaleString()}`);
      return { success: false, error: 'Below minimum payout' };
    }

    if (payoutAmount > availableBalance) {
      toast.error('Insufficient balance');
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      const payoutRef = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const fee = 6500; // Rp 6,500 transfer fee
      const netAmount = payoutAmount - fee;

      // Get released commissions to include
      const releasedCommissions = commissions.filter(c => c.status === 'released' && !c.payout_id);
      const commissionIds = releasedCommissions.map(c => c.id);

      const { data, error } = await supabase
        .from('vendor_payouts')
        .insert({
          payout_reference: payoutRef,
          vendor_id: user.id,
          amount: payoutAmount,
          fee,
          net_amount: netAmount,
          currency: 'IDR',
          status: 'pending',
          bank_name: payoutSettings.bank_name,
          account_number: payoutSettings.account_number,
          account_holder_name: payoutSettings.account_holder_name,
          commission_ids: commissionIds
        })
        .select()
        .single();

      if (error) throw error;

      // Update commissions to link to payout
      if (commissionIds.length > 0) {
        await supabase
          .from('transaction_commissions')
          .update({ payout_id: data.id, status: 'paid' })
          .in('id', commissionIds);
      }

      await fetchCommissions();
      await fetchPayouts();

      toast.success('Payout requested successfully');
      return { success: true, data };
    } catch (err: any) {
      console.error('Error requesting payout:', err);
      toast.error('Failed to request payout');
      return { success: false, error: err.message };
    }
  }, [user, payoutSettings, availableBalance, commissions, fetchCommissions, fetchPayouts]);

  // Create dispute
  const createDispute = useCallback(async (params: {
    transactionId: string;
    againstUser?: string;
    disputeType: Dispute['dispute_type'];
    disputeReason: string;
    amount: number;
    evidence?: any[];
  }) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const disputeRef = `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data, error } = await supabase
        .from('payment_disputes')
        .insert({
          dispute_reference: disputeRef,
          transaction_id: params.transactionId,
          raised_by: user.id,
          against_user: params.againstUser,
          dispute_type: params.disputeType,
          dispute_reason: params.disputeReason,
          amount: params.amount,
          evidence: params.evidence || [],
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchDisputes();
      toast.success('Dispute submitted successfully');
      return { success: true, data };
    } catch (err: any) {
      console.error('Error creating dispute:', err);
      toast.error('Failed to create dispute');
      return { success: false, error: err.message };
    }
  }, [user, fetchDisputes]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPayoutSettings(),
        fetchCommissions(),
        fetchPayouts(),
        fetchDisputes()
      ]);
      setIsLoading(false);
    };
    
    if (user) loadData();
  }, [user, fetchPayoutSettings, fetchCommissions, fetchPayouts, fetchDisputes]);

  return {
    payoutSettings,
    commissions,
    payouts,
    disputes,
    availableBalance,
    pendingBalance,
    isLoading,
    savePayoutSettings,
    requestPayout,
    createDispute,
    refetch: () => Promise.all([fetchPayoutSettings(), fetchCommissions(), fetchPayouts(), fetchDisputes()]),
    hasPayoutSettings: !!payoutSettings,
    isVerified: payoutSettings?.is_verified || false
  };
}
