import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RefundRequest {
  id: string;
  transaction_id: string;
  order_id: string;
  user_id: string;
  amount: number;
  reason: string;
  reason_category: 'service_not_delivered' | 'duplicate_payment' | 'wrong_amount' | 'customer_request' | 'other';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  refund_method: 'original_payment' | 'wallet_credit' | 'bank_transfer';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  transaction_id: string;
  order_id: string;
  user_id: string;
  vendor_id?: string;
  amount: number;
  category: 'service_quality' | 'non_delivery' | 'billing' | 'fraud' | 'other';
  description: string;
  evidence_urls?: string[];
  status: 'open' | 'under_review' | 'resolved_buyer' | 'resolved_seller' | 'escalated' | 'closed';
  resolution?: string;
  resolution_amount?: number;
  assigned_to?: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  messages: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  sender_id: string;
  sender_type: 'buyer' | 'seller' | 'admin';
  message: string;
  attachments?: string[];
  created_at: string;
}

export const useRefundDispute = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create refund request
  const createRefundRequest = useCallback(async (params: {
    transactionId: string;
    orderId: string;
    amount: number;
    reason: string;
    reasonCategory: RefundRequest['reason_category'];
    refundMethod?: RefundRequest['refund_method'];
  }) => {
    if (!user) {
      toast.error('Please login');
      return null;
    }

    setIsLoading(true);
    try {
      // Get transaction details
      const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', params.transactionId)
        .single();

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Can only refund completed transactions');
      }

      // Create refund request
      const refundData = {
        transaction_id: params.transactionId,
        order_id: params.orderId,
        user_id: user.id,
        amount: params.amount,
        reason: params.reason,
        reason_category: params.reasonCategory,
        refund_method: params.refundMethod || 'original_payment',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Store in payment_transactions as a refund type
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          customer_id: user.id,
          order_id: `REF-${params.orderId}`,
          amount: -params.amount,
          currency: 'IDR',
          status: 'pending',
          payment_method: 'refund',
          gateway_response: refundData as any
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Create admin alert
      await supabase.from('admin_alerts').insert({
        title: 'New Refund Request',
        message: `Refund request for ${params.amount.toLocaleString('id-ID')} IDR - ${params.reason}`,
        type: 'refund',
        priority: 'high',
        action_required: true,
        reference_id: data.id,
        reference_type: 'refund'
      });

      toast.success('Refund request submitted');
      return { ...refundData, id: data.id } as RefundRequest;
    } catch (error: any) {
      console.error('Failed to create refund:', error);
      toast.error(error.message || 'Failed to create refund request');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Process refund (admin)
  const processRefund = useCallback(async (
    refundId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    setIsLoading(true);
    try {
      const newStatus = action === 'approve' ? 'processing' : 'rejected';

      const { error } = await supabase
        .from('payment_transactions')
        .update({
          status: newStatus,
          gateway_response: {
            admin_notes: notes,
            processed_by: user?.id,
            processed_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', refundId);

      if (error) throw error;

      if (action === 'approve') {
        // Call Midtrans refund API
        const { error: refundError } = await supabase.functions.invoke('midtrans-payment', {
          body: {
            action: 'refund',
            refund_id: refundId
          }
        });

        if (refundError) {
          console.error('Midtrans refund failed:', refundError);
        }
      }

      toast.success(`Refund ${action === 'approve' ? 'approved' : 'rejected'}`);
      return true;
    } catch (error: any) {
      console.error('Failed to process refund:', error);
      toast.error('Failed to process refund');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch refund requests
  const fetchRefunds = useCallback(async (status?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('payment_transactions')
        .select('*')
        .eq('payment_method', 'refund')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mappedRefunds: RefundRequest[] = (data || []).map(tx => {
        const gatewayResponse = tx.gateway_response as any;
        return {
          id: tx.id,
          transaction_id: gatewayResponse?.transaction_id || '',
          order_id: tx.order_id?.replace('REF-', '') || '',
          user_id: tx.customer_id || '',
          amount: Math.abs(tx.amount),
          reason: gatewayResponse?.reason || '',
          reason_category: gatewayResponse?.reason_category || 'other',
          status: tx.status as RefundRequest['status'],
          refund_method: gatewayResponse?.refund_method || 'original_payment',
          admin_notes: gatewayResponse?.admin_notes,
          processed_by: gatewayResponse?.processed_by,
          processed_at: gatewayResponse?.processed_at,
          created_at: tx.created_at
        };
      });

      setRefunds(mappedRefunds);
    } catch (error: any) {
      console.error('Failed to fetch refunds:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create dispute
  const createDispute = useCallback(async (params: {
    transactionId: string;
    orderId: string;
    vendorId?: string;
    amount: number;
    category: Dispute['category'];
    description: string;
    evidenceUrls?: string[];
  }) => {
    if (!user) {
      toast.error('Please login');
      return null;
    }

    setIsLoading(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days to resolve

      const disputeData = {
        transaction_id: params.transactionId,
        order_id: params.orderId,
        user_id: user.id,
        vendor_id: params.vendorId,
        amount: params.amount,
        category: params.category,
        description: params.description,
        evidence_urls: params.evidenceUrls,
        status: 'open',
        due_date: dueDate.toISOString(),
        messages: []
      };

      // Store as payment transaction
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          customer_id: user.id,
          order_id: `DSP-${params.orderId}`,
          amount: params.amount,
          currency: 'IDR',
          status: 'pending',
          payment_method: 'dispute',
          gateway_response: disputeData as any
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Create admin alert
      await supabase.from('admin_alerts').insert({
        title: 'New Dispute Filed',
        message: `Dispute for ${params.amount.toLocaleString('id-ID')} IDR - ${params.category}`,
        type: 'dispute',
        priority: 'high',
        action_required: true,
        reference_id: data.id,
        reference_type: 'dispute'
      });

      // Notify vendor if applicable - log for now
      if (params.vendorId) {
        console.log('Vendor notification for dispute:', {
          vendor_id: params.vendorId,
          dispute_id: data.id
        });
      }

      toast.success('Dispute submitted successfully');
      return { ...disputeData, id: data.id } as Dispute;
    } catch (error: any) {
      console.error('Failed to create dispute:', error);
      toast.error('Failed to file dispute');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add message to dispute
  const addDisputeMessage = useCallback(async (
    disputeId: string,
    message: string,
    senderType: 'buyer' | 'seller' | 'admin',
    attachments?: string[]
  ) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { data: dispute } = await supabase
        .from('payment_transactions')
        .select('gateway_response')
        .eq('id', disputeId)
        .single();

      if (!dispute) throw new Error('Dispute not found');

      const gatewayResponse = dispute.gateway_response as any;
      const newMessage: DisputeMessage = {
        id: `msg-${Date.now()}`,
        sender_id: user.id,
        sender_type: senderType,
        message,
        attachments,
        created_at: new Date().toISOString()
      };

      const updatedMessages = [...(gatewayResponse?.messages || []), newMessage];

      const { error } = await supabase
        .from('payment_transactions')
        .update({
          gateway_response: { ...gatewayResponse, messages: updatedMessages },
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      if (error) throw error;

      toast.success('Message sent');
      return true;
    } catch (error: any) {
      console.error('Failed to add message:', error);
      toast.error('Failed to send message');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Resolve dispute (admin)
  const resolveDispute = useCallback(async (
    disputeId: string,
    resolution: 'resolved_buyer' | 'resolved_seller' | 'closed',
    resolutionNotes: string,
    resolutionAmount?: number
  ) => {
    setIsLoading(true);
    try {
      const { data: dispute } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', disputeId)
        .single();

      if (!dispute) throw new Error('Dispute not found');

      const gatewayResponse = dispute.gateway_response as any;

      const { error } = await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          gateway_response: {
            ...gatewayResponse,
            status: resolution,
            resolution: resolutionNotes,
            resolution_amount: resolutionAmount,
            resolved_by: user?.id,
            resolved_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      if (error) throw error;

      // If resolved in buyer's favor and amount specified, create refund
      if (resolution === 'resolved_buyer' && resolutionAmount && resolutionAmount > 0) {
        await createRefundRequest({
          transactionId: gatewayResponse.transaction_id,
          orderId: gatewayResponse.order_id,
          amount: resolutionAmount,
          reason: `Dispute resolution: ${resolutionNotes}`,
          reasonCategory: 'other'
        });
      }

      toast.success('Dispute resolved');
      return true;
    } catch (error: any) {
      console.error('Failed to resolve dispute:', error);
      toast.error('Failed to resolve dispute');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, createRefundRequest]);

  // Fetch disputes
  const fetchDisputes = useCallback(async (status?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('payment_transactions')
        .select('*')
        .eq('payment_method', 'dispute')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mappedDisputes: Dispute[] = (data || []).map(tx => {
        const gatewayResponse = tx.gateway_response as any;
        return {
          id: tx.id,
          transaction_id: gatewayResponse?.transaction_id || '',
          order_id: tx.order_id?.replace('DSP-', '') || '',
          user_id: tx.customer_id || '',
          vendor_id: gatewayResponse?.vendor_id,
          amount: tx.amount,
          category: gatewayResponse?.category || 'other',
          description: gatewayResponse?.description || '',
          evidence_urls: gatewayResponse?.evidence_urls,
          status: gatewayResponse?.status || 'open',
          resolution: gatewayResponse?.resolution,
          resolution_amount: gatewayResponse?.resolution_amount,
          assigned_to: gatewayResponse?.assigned_to,
          due_date: gatewayResponse?.due_date || tx.created_at,
          created_at: tx.created_at,
          updated_at: tx.updated_at,
          messages: gatewayResponse?.messages || []
        };
      });

      setDisputes(mappedDisputes);
    } catch (error: any) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    refunds,
    disputes,
    isLoading,
    createRefundRequest,
    processRefund,
    fetchRefunds,
    createDispute,
    addDisputeMessage,
    resolveDispute,
    fetchDisputes
  };
};

export default useRefundDispute;
