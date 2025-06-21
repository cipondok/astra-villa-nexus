
import { useState, useEffect } from 'react';
import { useAstraToken } from './useAstraToken';

export interface TokenBalanceState {
  balance: string | null;
  isLoading: boolean;
  hasMinimumBalance: (requiredAmount: string) => boolean;
  refresh: () => void;
}

export const useTokenBalance = (): TokenBalanceState => {
  const { balance, isLoading, fetchBalance } = useAstraToken();
  const [balanceString, setBalanceString] = useState<string | null>(null);

  useEffect(() => {
    if (balance !== undefined) {
      setBalanceString(balance.toString());
    } else {
      setBalanceString(null);
    }
  }, [balance]);

  const hasMinimumBalance = (requiredAmount: string): boolean => {
    if (!balanceString || !requiredAmount) return false;
    const balanceNum = parseFloat(balanceString);
    const requiredNum = parseFloat(requiredAmount);
    return balanceNum >= requiredNum;
  };

  const refresh = () => {
    fetchBalance();
  };

  return {
    balance: balanceString,
    isLoading,
    hasMinimumBalance,
    refresh,
  };
};
