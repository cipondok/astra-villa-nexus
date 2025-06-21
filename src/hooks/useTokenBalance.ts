
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

  // Get ASTRA token balance - only if we have a valid token address
  const { 
    data: tokenBalance, 
    isLoading, 
    refetch 
  } = useBalance({
    address,
    token: ASTRA_TOKEN_ADDRESS !== '0x0000000000000000000000000000000000000000' ? ASTRA_TOKEN_ADDRESS : undefined,
    query: {
      enabled: isConnected && !!address && ASTRA_TOKEN_ADDRESS !== '0x0000000000000000000000000000000000000000',
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
