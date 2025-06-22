
import { useState, useEffect, useCallback } from 'react';
import { astraAPI, User, Property, Transaction, APIResponse } from '@/services/astraTokenAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAstraToken = () => {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  // Fetch user balance
  const fetchBalance = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      console.log('No authenticated user, setting balance to 0');
      setBalance(0);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching balance for authenticated user:', user.id);
      const response = await astraAPI.getUserBalance(user.id);
      console.log('Balance response:', response);
      if (response.success && response.data) {
        setBalance(response.data.balance);
      } else {
        console.log('Balance fetch failed, using default balance of 0:', response.error);
        setBalance(0); // Set default balance instead of showing error
      }
    } catch (error) {
      console.log('Balance fetch error, using default balance:', error);
      setBalance(0); // Set default balance instead of showing error
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Fetch transaction history
  const fetchTransactions = useCallback(async (limit?: number) => {
    if (!user?.id || !isAuthenticated) {
      console.log('No authenticated user, clearing transactions');
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching transactions for authenticated user:', user.id);
      const response = await astraAPI.getTransactionHistory(user.id, limit);
      console.log('Transactions response:', response);
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        console.log('Transactions fetch failed, using empty array:', response.error);
        setTransactions([]); // Set empty array instead of showing error
      }
    } catch (error) {
      console.log('Transactions fetch error, using empty array:', error);
      setTransactions([]); // Set empty array instead of showing error
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Fetch properties
  const fetchProperties = useCallback(async (limit?: number) => {
    setIsLoading(true);
    try {
      const response = await astraAPI.getProperties(limit);
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        console.log('Properties fetch failed, using empty array:', response.error);
        setProperties([]); // Set empty array instead of showing error
      }
    } catch (error) {
      console.log('Error fetching properties, using empty array:', error);
      setProperties([]); // Set empty array instead of showing error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase property
  const purchaseProperty = useCallback(async (property: Property) => {
    if (!user?.id || !isAuthenticated) {
      toast.error('Please log in to purchase properties');
      return false;
    }

    if (balance < property.price_astra) {
      toast.error('Insufficient ASTRA balance');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await astraAPI.purchaseProperty(
        property.id,
        user.id,
        property.price_astra
      );

      if (response.success) {
        toast.success(`Successfully purchased ${property.title}!`);
        await fetchBalance(); // Refresh balance
        await fetchTransactions(); // Refresh transactions
        await fetchProperties(); // Refresh properties to update status
        return true;
      } else {
        toast.error('Purchase failed: ' + response.error);
        return false;
      }
    } catch (error) {
      toast.error('Error processing purchase');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, balance, fetchBalance, fetchTransactions, fetchProperties]);

  // Add balance (admin function)
  const addBalance = useCallback(async (amount: number, reason: string) => {
    if (!user?.id || !isAuthenticated) return false;

    setIsLoading(true);
    try {
      const response = await astraAPI.addBalance(user.id, amount, reason);
      if (response.success) {
        toast.success(`Added ${amount} ASTRA tokens`);
        await fetchBalance();
        return true;
      } else {
        toast.error('Failed to add balance: ' + response.error);
        return false;
      }
    } catch (error) {
      toast.error('Error adding balance');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, fetchBalance]);

  // Load initial data based on authentication status
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      console.log('User authenticated, fetching ASTRA data for:', user.id);
      fetchBalance();
      fetchTransactions(10); // Last 10 transactions
    } else {
      console.log('User not authenticated, using default values');
      setBalance(0);
      setTransactions([]);
    }
  }, [user?.id, isAuthenticated, fetchBalance, fetchTransactions]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    balance,
    transactions,
    properties,
    isLoading,
    purchaseProperty,
    fetchBalance,
    fetchTransactions,
    fetchProperties,
    addBalance,
  };
};
