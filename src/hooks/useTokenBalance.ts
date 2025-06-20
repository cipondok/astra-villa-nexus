
import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ASTRA_TOKEN_ADDRESS } from '@/lib/web3';

export interface TokenBalanceState {
  balance: string | null;
  isLoading: boolean;
  hasMinimumBalance: (requiredAmount: string) => boolean;
  refresh: () => void;
}

export const useTokenBalance = (): TokenBalanceState => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string | null>(null);

  // Get ASTRA token balance
  const { 
    data: tokenBalance, 
    isLoading, 
    refetch 
  } = useBalance({
    address,
    token: ASTRA_TOKEN_ADDRESS,
    query: {
      enabled: isConnected && !!address,
    },
  });

  useEffect(() => {
    if (tokenBalance) {
      const balanceString = tokenBalance.formatted;
      setBalance(balanceString);
    } else {
      setBalance(null);
    }
  }, [tokenBalance]);

  const hasMinimumBalance = (requiredAmount: string): boolean => {
    if (!balance || !requiredAmount) return false;
    const balanceNum = parseFloat(balance);
    const requiredNum = parseFloat(requiredAmount);
    return balanceNum >= requiredNum;
  };

  const refresh = () => {
    refetch();
  };

  return {
    balance,
    isLoading,
    hasMinimumBalance,
    refresh,
  };
};
