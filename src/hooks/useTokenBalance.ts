
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useTokenBalance = () => {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Mock token balance
      setBalance('100');
    } else {
      setBalance('0');
    }
  }, [isAuthenticated]);

  return {
    balance,
    isLoading,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => {
        setBalance('100');
        setIsLoading(false);
      }, 1000);
    }
  };
};
