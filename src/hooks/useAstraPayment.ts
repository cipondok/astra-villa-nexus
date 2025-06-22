
import { useState, useEffect, useCallback } from 'react';
import { astraPaymentAPI, User, Property, PaymentTransaction, PaymentMethod } from '@/services/astraPaymentAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAstraPayment = () => {
  const { user, isAuthenticated } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      console.log('No authenticated user, skipping payment methods fetch');
      return;
    }

    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.getPaymentMethods(user.id);
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      } else {
        console.error('Payment methods fetch failed:', response.error);
        toast.error('Failed to fetch payment methods: ' + response.error);
      }
    } catch (error) {
      console.error('Payment methods fetch error:', error);
      toast.error('Error fetching payment methods');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Fetch transaction history
  const fetchTransactions = useCallback(async (limit?: number) => {
    if (!user?.id || !isAuthenticated) {
      console.log('No authenticated user, skipping transactions fetch');
      return;
    }

    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.getTransactionHistory(user.id, limit);
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        console.error('Transactions fetch failed:', response.error);
        toast.error('Failed to fetch transactions: ' + response.error);
      }
    } catch (error) {
      console.error('Transactions fetch error:', error);
      toast.error('Error fetching transactions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Fetch properties
  const fetchProperties = useCallback(async (limit?: number, filters?: any) => {
    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.getProperties(limit, filters);
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        toast.error('Failed to fetch properties: ' + response.error);
      }
    } catch (error) {
      toast.error('Error fetching properties');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase property with payment
  const purchaseProperty = useCallback(async (
    property: Property, 
    paymentMethodId: string
  ) => {
    if (!user?.id || !isAuthenticated) {
      toast.error('Please log in to purchase properties');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.initiatePayment(
        property.id,
        user.id,
        paymentMethodId,
        property.price,
        property.currency
      );

      if (response.success && response.data) {
        // Open payment URL in new tab
        window.open(response.data.paymentUrl, '_blank');
        toast.success('Payment initiated. Complete the payment in the new tab.');
        return true;
      } else {
        toast.error('Payment initiation failed: ' + response.error);
        return false;
      }
    } catch (error) {
      toast.error('Error processing payment');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Add payment method
  const addPaymentMethod = useCallback(async (paymentData: Partial<PaymentMethod>) => {
    if (!user?.id || !isAuthenticated) return false;

    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.addPaymentMethod(user.id, paymentData);
      if (response.success) {
        toast.success('Payment method added successfully');
        await fetchPaymentMethods();
        return true;
      } else {
        toast.error('Failed to add payment method: ' + response.error);
        return false;
      }
    } catch (error) {
      toast.error('Error adding payment method');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, fetchPaymentMethods]);

  // Load initial data
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      console.log('User authenticated, fetching payment data for:', user.id);
      fetchPaymentMethods();
      fetchTransactions(10);
    } else {
      console.log('User not authenticated, clearing data');
      setPaymentMethods([]);
      setTransactions([]);
    }
  }, [user?.id, isAuthenticated, fetchPaymentMethods, fetchTransactions]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    paymentMethods,
    transactions,
    properties,
    isLoading,
    purchaseProperty,
    addPaymentMethod,
    fetchPaymentMethods,
    fetchTransactions,
    fetchProperties,
  };
};
