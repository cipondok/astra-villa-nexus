import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_annual: number | null;
  currency: string;
  listing_limit: number | null;
  features: string[];
  is_active: boolean;
  display_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  billing_cycle: 'monthly' | 'annual';
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  cancel_at_period_end: boolean;
  plan?: SubscriptionPlan;
}

export interface SubscriptionInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription plans
  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching plans:', error);
      return;
    }

    setPlans((data || []).map(p => {
      let features: string[] = [];
      if (Array.isArray(p.features)) {
        features = p.features as string[];
      } else if (typeof p.features === 'string') {
        try { features = JSON.parse(p.features); } catch { features = []; }
      }
      return { ...p, features } as SubscriptionPlan;
    }));
  }, []);

  // Fetch user's current subscription
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    // Fetch subscription separately to avoid relation issues
    const { data: subData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return;
    }

    if (subData && subData.plan_id) {
      // Fetch plan separately
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subData.plan_id)
        .single();

      let planFeatures: string[] = [];
      if (planData?.features) {
        if (Array.isArray(planData.features)) {
          planFeatures = planData.features as string[];
        } else if (typeof planData.features === 'string') {
          try { planFeatures = JSON.parse(planData.features); } catch { planFeatures = []; }
        }
      }

      // Map database fields to interface (handle both old and new column names)
      const sub: any = subData;
      setSubscription({
        id: sub.id,
        user_id: sub.user_id,
        plan_id: sub.plan_id,
        status: (sub.status || 'active') as UserSubscription['status'],
        billing_cycle: (sub.billing_cycle || 'monthly') as 'monthly' | 'annual',
        current_period_start: sub.current_period_start || sub.starts_at || new Date().toISOString(),
        current_period_end: sub.current_period_end || sub.ends_at || new Date().toISOString(),
        cancelled_at: sub.cancelled_at || null,
        cancel_at_period_end: sub.cancel_at_period_end || false,
        plan: planData ? { ...planData, features: planFeatures } as SubscriptionPlan : undefined
      });
    } else {
      setSubscription(null);
    }
  }, [user]);

  // Fetch user's invoices
  const fetchInvoices = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('subscription_invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching invoices:', error);
      return;
    }

    setInvoices((data || []) as SubscriptionInvoice[]);
  }, [user]);

  // Subscribe to a plan
  const subscribe = useCallback(async (planSlug: string) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return { success: false, error: 'Not authenticated' };
    }

    setIsLoading(true);
    
    try {
      const plan = plans.find(p => p.slug === planSlug);
      if (!plan) throw new Error('Plan not found');

      // Free plan - just create subscription
      if (plan.price_monthly === 0) {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const { data, error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            plan_id: plan.id,
            status: 'active',
            billing_cycle: 'monthly',
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        await fetchSubscription();
        toast.success('Successfully subscribed to Free plan!');
        return { success: true, data };
      }

      // Paid plan - create invoice and initiate payment
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const taxRate = 0.11; // 11% PPN
      const taxAmount = plan.price_monthly * taxRate;
      const totalAmount = plan.price_monthly + taxAmount;

      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('subscription_invoices')
        .insert({
          invoice_number: invoiceNumber,
          user_id: user.id,
          amount: plan.price_monthly,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          currency: 'IDR',
          status: 'pending',
          billing_period_start: periodStart.toISOString(),
          billing_period_end: periodEnd.toISOString(),
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          line_items: [{
            description: `${plan.name} Plan - Monthly Subscription`,
            amount: plan.price_monthly,
            quantity: 1
          }]
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create payment via Midtrans
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('midtrans-payment', {
        body: {
          action: 'create_transaction',
          order_id: `SUB-${invoiceNumber}`,
          gross_amount: totalAmount,
          customer_details: {
            email: user.email,
            first_name: user.user_metadata?.full_name || 'Customer'
          },
          item_details: [{
            id: plan.id,
            price: totalAmount,
            quantity: 1,
            name: `${plan.name} Plan Subscription`
          }]
        }
      });

      if (paymentError) throw paymentError;

      return { 
        success: true, 
        token: paymentData.token, 
        redirect_url: paymentData.redirect_url,
        invoice_id: invoice.id
      };

    } catch (err: any) {
      console.error('Subscription error:', err);
      toast.error(err.message || 'Failed to process subscription');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, plans, fetchSubscription]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (atPeriodEnd: boolean = true) => {
    if (!subscription) return { success: false, error: 'No active subscription' };

    try {
      const updateData: any = {
        cancel_at_period_end: atPeriodEnd,
        updated_at: new Date().toISOString()
      };

      if (!atPeriodEnd) {
        updateData.status = 'cancelled';
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchSubscription();
      toast.success(atPeriodEnd 
        ? 'Subscription will be cancelled at the end of the billing period' 
        : 'Subscription cancelled');
      return { success: true };

    } catch (err: any) {
      console.error('Cancel error:', err);
      toast.error('Failed to cancel subscription');
      return { success: false, error: err.message };
    }
  }, [subscription, fetchSubscription]);

  // Upgrade/downgrade plan
  const changePlan = useCallback(async (newPlanSlug: string) => {
    if (!subscription) {
      return subscribe(newPlanSlug);
    }

    // For now, just cancel current and subscribe to new
    await cancelSubscription(false);
    return subscribe(newPlanSlug);
  }, [subscription, subscribe, cancelSubscription]);

  // Check listing limits
  const canCreateListing = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    const plan = subscription?.plan || plans.find(p => p.slug === 'free');
    if (!plan || plan.listing_limit === null) return true; // Unlimited

    // Count current month's listings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    return (count || 0) < plan.listing_limit;
  }, [user, subscription, plans]);

  // Get remaining listings
  const getRemainingListings = useCallback(async (): Promise<number | null> => {
    if (!user) return 0;

    const plan = subscription?.plan || plans.find(p => p.slug === 'free');
    if (!plan || plan.listing_limit === null) return null; // Unlimited

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    return Math.max(0, plan.listing_limit - (count || 0));
  }, [user, subscription, plans]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPlans(), fetchSubscription(), fetchInvoices()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchPlans, fetchSubscription, fetchInvoices]);

  return {
    plans,
    subscription,
    invoices,
    isLoading,
    error,
    subscribe,
    cancelSubscription,
    changePlan,
    canCreateListing,
    getRemainingListings,
    refetch: () => Promise.all([fetchPlans(), fetchSubscription(), fetchInvoices()]),
    currentPlan: subscription?.plan || plans.find(p => p.slug === 'free'),
    isFreePlan: !subscription || subscription.plan?.slug === 'free',
    isPro: subscription?.plan?.slug === 'pro',
    isEnterprise: subscription?.plan?.slug === 'enterprise'
  };
}
