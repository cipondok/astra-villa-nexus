import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FlashDeal {
  id: string;
  property_id: string;
  seller_id: string;
  original_price: number;
  flash_price: number;
  discount_pct: number;
  start_time: string;
  end_time: string;
  status: string;
  reason: string | null;
  views_count: number;
  property: {
    id: string;
    title: string;
    price: number;
    city: string;
    property_type: string;
    thumbnail_url: string | null;
    investment_score: number;
    demand_heat_score: number;
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqm: number | null;
  };
}

export interface AuctionListing {
  id: string;
  property_id: string;
  title: string;
  description: string | null;
  starting_price: number;
  reserve_price: number | null;
  current_bid: number;
  minimum_increment: number;
  auction_type: string;
  status: string;
  start_time: string;
  end_time: string;
  total_bids: number;
  unique_bidders: number;
  bid_count: number;
  property: {
    id: string;
    title: string;
    price: number;
    city: string;
    property_type: string;
    thumbnail_url: string | null;
    investment_score: number;
  };
}

export function useFlashDeals() {
  return useQuery({
    queryKey: ['flash-deals'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('auction-flash-deals', {
        body: { mode: 'list_flash_deals' },
      });
      if (error) throw new Error(error.message);
      return (data?.deals || []) as FlashDeal[];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useAuctions() {
  return useQuery({
    queryKey: ['live-auctions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('auction-flash-deals', {
        body: { mode: 'list_auctions' },
      });
      if (error) throw new Error(error.message);
      return (data?.auctions || []) as AuctionListing[];
    },
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

export function usePlaceBid() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ auction_id, bid_amount }: { auction_id: string; bid_amount: number }) => {
      const { data, error } = await supabase.functions.invoke('auction-flash-deals', {
        body: { mode: 'place_bid', auction_id, bidder_id: user?.id, bid_amount },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-auctions'] });
      toast({ title: 'Bid Placed!', description: 'Your bid has been submitted successfully.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Bid Failed', description: err.message, variant: 'destructive' });
    },
  });
}

export function useCreateFlashDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: { property_id: string; seller_id: string; original_price: number; flash_price: number; duration_hours: number; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke('auction-flash-deals', {
        body: { mode: 'create_flash_deal', ...payload },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flash-deals'] });
      toast({ title: 'Flash Deal Activated!', description: 'Your deal is now live.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}

export function useCreateAuction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: { property_id: string; created_by: string; title: string; starting_price: number; reserve_price?: number; minimum_increment?: number; duration_hours?: number }) => {
      const { data, error } = await supabase.functions.invoke('auction-flash-deals', {
        body: { mode: 'create_auction', ...payload },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-auctions'] });
      toast({ title: 'Auction Created!', description: 'Auction is now live.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}
