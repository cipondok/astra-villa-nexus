import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type OfferStatus = 'submitted' | 'seller_reviewing' | 'counter_offer' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'withdrawn' | 'expired';
export type FinancingMethod = 'cash' | 'mortgage' | 'mixed';
export type MessageType = 'text' | 'counter_offer' | 'status_change' | 'document' | 'milestone';
export type SenderRole = 'buyer' | 'seller' | 'agent' | 'system';

export interface PropertyOffer {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string | null;
  agent_id: string | null;
  offer_price: number;
  counter_price: number | null;
  financing_method: FinancingMethod;
  completion_timeline: string | null;
  buyer_message: string | null;
  status: OfferStatus;
  property_title: string | null;
  property_image: string | null;
  property_original_price: number | null;
  rejection_reason: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  expired_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OfferMessage {
  id: string;
  offer_id: string;
  sender_id: string;
  sender_role: SenderRole;
  message: string;
  message_type: MessageType;
  metadata: Record<string, any>;
  created_at: string;
}

export const OFFER_STATUS_CONFIG: Record<OfferStatus, { label: string; icon: string; color: string; bg: string; step: number }> = {
  submitted: { label: 'Submitted', icon: '📨', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', step: 1 },
  seller_reviewing: { label: 'Reviewing', icon: '👀', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', step: 2 },
  counter_offer: { label: 'Counter Offer', icon: '🔄', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30', step: 2 },
  accepted: { label: 'Accepted', icon: '🤝', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', step: 3 },
  in_progress: { label: 'In Progress', icon: '⚙️', color: 'text-chart-1', bg: 'bg-chart-1/10 border-chart-1/30', step: 4 },
  completed: { label: 'Completed', icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-600/10 border-emerald-600/30', step: 5 },
  rejected: { label: 'Rejected', icon: '❌', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', step: -1 },
  withdrawn: { label: 'Withdrawn', icon: '↩️', color: 'text-muted-foreground', bg: 'bg-muted/20 border-border/30', step: -1 },
  expired: { label: 'Expired', icon: '⏰', color: 'text-muted-foreground', bg: 'bg-muted/20 border-border/30', step: -1 },
};

const TIMELINE_STEPS = [
  { status: 'submitted', label: 'Offer Submitted' },
  { status: 'seller_reviewing', label: 'Seller Reviewing' },
  { status: 'accepted', label: 'Offer Accepted' },
  { status: 'in_progress', label: 'Transaction' },
  { status: 'completed', label: 'Completed' },
] as const;

export { TIMELINE_STEPS };

// ── Queries ──

/** Fetch all offers for the current user (as buyer, seller, or agent) */
export function useMyOffers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-offers', user?.id],
    queryFn: async (): Promise<PropertyOffer[]> => {
      if (!user?.id) return [];
      const { data, error } = await (supabase as any)
        .from('property_offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PropertyOffer[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

/** Fetch a single offer */
export function useOffer(offerId: string | undefined) {
  return useQuery({
    queryKey: ['offer', offerId],
    queryFn: async (): Promise<PropertyOffer | null> => {
      if (!offerId) return null;
      const { data, error } = await (supabase as any)
        .from('property_offers')
        .select('*')
        .eq('id', offerId)
        .single();
      if (error) throw error;
      return data as PropertyOffer;
    },
    enabled: !!offerId,
  });
}

/** Fetch messages for an offer */
export function useOfferMessages(offerId: string | undefined) {
  return useQuery({
    queryKey: ['offer-messages', offerId],
    queryFn: async (): Promise<OfferMessage[]> => {
      if (!offerId) return [];
      const { data, error } = await (supabase as any)
        .from('offer_messages')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as OfferMessage[];
    },
    enabled: !!offerId,
    refetchInterval: 15_000,
  });
}

// ── Mutations ──

export interface CreateOfferInput {
  property_id: string;
  seller_id?: string | null;
  agent_id?: string | null;
  offer_price: number;
  financing_method: FinancingMethod;
  completion_timeline?: string;
  buyer_message?: string;
  property_title?: string;
  property_image?: string;
  property_original_price?: number;
}

export function useCreateOffer() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOfferInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await (supabase as any)
        .from('property_offers')
        .insert({ ...input, buyer_id: user.id })
        .select()
        .single();
      if (error) throw error;

      // Add system message
      await (supabase as any).from('offer_messages').insert({
        offer_id: data.id,
        sender_id: user.id,
        sender_role: 'system',
        message: `Offer of Rp ${input.offer_price.toLocaleString('id-ID')} submitted via ${input.financing_method}.`,
        message_type: 'status_change',
      });

      return data as PropertyOffer;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-offers'] });
      toast.success('Offer submitted successfully!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateOfferStatus() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ offerId, status, counterPrice, message, rejectionReason }: {
      offerId: string;
      status: OfferStatus;
      counterPrice?: number;
      message?: string;
      rejectionReason?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const updates: Partial<PropertyOffer> = { status };
      if (counterPrice) updates.counter_price = counterPrice;
      if (rejectionReason) updates.rejection_reason = rejectionReason;
      if (status === 'accepted') updates.accepted_at = new Date().toISOString();
      if (status === 'completed') updates.completed_at = new Date().toISOString();

      const { error } = await (supabase as any)
        .from('property_offers')
        .update(updates)
        .eq('id', offerId);
      if (error) throw error;

      // System message for status change
      const statusLabel = OFFER_STATUS_CONFIG[status].label;
      const sysMsg = counterPrice
        ? `Counter offer of Rp ${counterPrice.toLocaleString('id-ID')} proposed.`
        : `Status changed to "${statusLabel}". ${message || ''}`;
      
      const senderRole = status === 'withdrawn' ? 'buyer' : 'seller';
      await (supabase as any).from('offer_messages').insert({
        offer_id: offerId,
        sender_id: user.id,
        sender_role: senderRole,
        message: sysMsg.trim(),
        message_type: counterPrice ? 'counter_offer' : 'status_change',
        metadata: counterPrice ? { counter_price: counterPrice } : {},
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-offers'] });
      qc.invalidateQueries({ queryKey: ['offer'] });
      qc.invalidateQueries({ queryKey: ['offer-messages'] });
      toast.success('Offer updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendOfferMessage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ offerId, message, senderRole, messageType }: {
      offerId: string;
      message: string;
      senderRole: SenderRole;
      messageType?: MessageType;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await (supabase as any).from('offer_messages').insert({
        offer_id: offerId,
        sender_id: user.id,
        sender_role: senderRole,
        message,
        message_type: messageType || 'text',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offer-messages'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
