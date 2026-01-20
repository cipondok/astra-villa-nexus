import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { UserOrder, OrderType, OrderStatus } from './types';

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data as UserOrder[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateOrder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      order_type: OrderType;
      title: string;
      description?: string;
      metadata?: Record<string, any>;
      total_amount?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_orders')
        .insert({
          user_id: user.id,
          order_type: orderData.order_type,
          title: orderData.title,
          description: orderData.description || null,
          metadata: orderData.metadata || {},
          total_amount: orderData.total_amount || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      toast({
        title: 'Order Created',
        description: 'Your order has been submitted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useOrderById = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('user_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as UserOrder;
    },
    enabled: !!orderId,
  });
};

export const useOrderStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, pending: 0, completed: 0 };

      const { data, error } = await supabase
        .from('user_orders')
        .select('status')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(o => ['pending', 'under_review', 'in_progress'].includes(o.status)).length,
        completed: data.filter(o => o.status === 'completed').length,
      };

      return stats;
    },
    enabled: !!user?.id,
  });
};
