
import { useState, useEffect, useCallback } from 'react';
import { astraPaymentAPI, User, Property, PaymentTransaction, PaymentMethod } from '@/services/astraPaymentAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAstraPayment = () => {
  const { user, isAuthenticated } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [vendorServices, setVendorServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch payment methods (requires authentication)
  const fetchPaymentMethods = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      console.log('No authenticated user, skipping payment methods fetch');
      setPaymentMethods([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.getPaymentMethods(user.id);
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      } else {
        console.error('Payment methods fetch failed:', response.error);
        
        // Don't show error toast for auth issues - the API service will handle it
        if (!response.error?.includes('login') && !response.error?.includes('Authentication')) {
          toast.error('Failed to fetch payment methods: ' + response.error);
        }
      }
    } catch (error) {
      console.error('Payment methods fetch error:', error);
      toast.error('Error fetching payment methods');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Fetch transaction history (requires authentication)
  const fetchTransactions = useCallback(async (limit?: number) => {
    if (!user?.id || !isAuthenticated) {
      console.log('No authenticated user, skipping transactions fetch');
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.getTransactionHistory(user.id, limit);
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        console.error('Transactions fetch failed:', response.error);
        
        // Don't show error toast for auth issues - the API service will handle it
        if (!response.error?.includes('login') && !response.error?.includes('Authentication')) {
          toast.error('Failed to fetch transactions: ' + response.error);
        }
      }
    } catch (error) {
      console.error('Transactions fetch error:', error);
      toast.error('Error fetching transactions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Fetch properties (public access)
  const fetchProperties = useCallback(async (limit?: number, filters?: any) => {
    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.getProperties(limit, filters);
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        console.warn('Properties fetch failed:', response.error);
        // Don't show error for public property browsing
      }
    } catch (error) {
      console.warn('Error fetching properties:', error);
      // Don't show error for public property browsing
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch vendor services (public access for browsing)
  const fetchVendorServices = useCallback(async (vendorId?: string, limit?: number) => {
    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.getVendorServices(vendorId, limit);
      if (response.success && response.data) {
        setVendorServices(response.data);
      } else {
        console.warn('Vendor services fetch failed:', response.error);
      }
    } catch (error) {
      console.warn('Error fetching vendor services:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase property with standard payment methods (requires authentication)
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

  // Pay for vendor service with ASTRA Token (requires authentication)
  const payWithAstraToken = useCallback(async (
    serviceId: string,
    vendorId: string,
    amount: number,
    serviceType: string
  ) => {
    if (!user?.id || !isAuthenticated) {
      toast.error('Please log in to use ASTRA Token payments');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await astraPaymentAPI.payWithAstraToken(
        serviceId,
        vendorId,
        user.id,
        amount,
        serviceType
      );

      if (response.success && response.data) {
        toast.success('ASTRA Token payment completed successfully!');
        // Refresh transaction history
        await fetchTransactions(10);
        return true;
      } else {
        toast.error('ASTRA Token payment failed: ' + response.error);
        return false;
      }
    } catch (error) {
      toast.error('Error processing ASTRA Token payment');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, fetchTransactions]);

  // Add payment method (requires authentication)
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

  // Load data based on authentication status
  useEffect(() => {
    // Always fetch properties (public access)
    fetchProperties();
    fetchVendorServices();

    if (user?.id && isAuthenticated) {
      console.log('User authenticated, fetching payment data for:', user.id);
      fetchPaymentMethods();
      fetchTransactions(10);
    } else {
      console.log('User not authenticated, clearing private data');
      setPaymentMethods([]);
      setTransactions([]);
    }
  }, [user?.id, isAuthenticated, fetchPaymentMethods, fetchTransactions, fetchProperties, fetchVendorServices]);

  return {
    paymentMethods,
    transactions,
    properties,
    vendorServices,
    isLoading,
    purchaseProperty,
    payWithAstraToken,
    addPaymentMethod,
    fetchPaymentMethods,
    fetchTransactions,
    fetchProperties,
    fetchVendorServices,
  };
};
