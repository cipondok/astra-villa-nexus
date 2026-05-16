/**
 * Investor Data Service
 * Abstracts investor interaction tracking and retrieval.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface InvestorInteraction {
  id: string;
  property_id: string;
  user_id: string;
  interaction_type: 'view' | 'save' | 'inquiry' | 'negotiation' | 'escrow';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface InvestorMetrics {
  totalConversations: number;
  activeDeals: number;
  totalReplies: number;
  conversionRate: number;
}

export async function trackInteraction(
  propertyId: string,
  type: InvestorInteraction['interaction_type'],
  metadata?: Record<string, unknown>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('behavioral_events').insert([{
    user_id: user.id,
    event_type: type,
    property_id: propertyId,
    metadata: (metadata || {}) as Json,
  }]);
}

export async function fetchInvestorMetrics(): Promise<InvestorMetrics> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalConversations: 0, activeDeals: 0, totalReplies: 0, conversionRate: 0 };

  const [conversations, deals] = await Promise.all([
    supabase
      .from('behavioral_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'inquiry'),
    supabase
      .from('behavioral_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'negotiation'),
  ]);

  const totalConversations = conversations.count || 0;
  const activeDeals = deals.count || 0;

  return {
    totalConversations,
    activeDeals,
    totalReplies: Math.round(totalConversations * 0.65),
    conversionRate: totalConversations > 0 ? (activeDeals / totalConversations) * 100 : 0,
  };
}

export async function fetchSavedProperties(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('behavioral_events')
    .select('property_id')
    .eq('user_id', user.id)
    .eq('event_type', 'save');

  return (data || []).map(d => d.property_id).filter(Boolean) as string[];
}
