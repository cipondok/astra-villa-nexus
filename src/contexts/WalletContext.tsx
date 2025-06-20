
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { formatUnits } from 'viem';
import { useAuth } from './AuthContext';
import { ASTRA_TOKEN_ADDRESS } from '@/lib/web3';
import { checkWalletConnection, linkWalletToUser } from '@/lib/wallet-utils';

interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
  balance: string | null;
  astraBalance: string | null;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  linkWalletToProfile: () => Promise<void>;
  isWalletLinked: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { user, profile } = useAuth();
  const [isWalletLinked, setIsWalletLinked] = useState(false);
  const [astraBalance, setAstraBalance] = useState<string | null>(null);

  // Get BNB balance
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
  });

  // Get ASTRA token balance
  const { data: tokenBalance, isLoading: tokenLoading } = useBalance({
    address,
    token: ASTRA_TOKEN_ADDRESS,
  });

  const isLoading = balanceLoading || tokenLoading;

  // Check if wallet is linked to current user profile
  useEffect(() => {
    const checkWalletLink = async () => {
      if (!user || !address) {
        setIsWalletLinked(false);
        return;
      }

      try {
        const isLinked = await checkWalletConnection(user.id, address);
        setIsWalletLinked(isLinked);
      } catch (error) {
        console.error('Error checking wallet link:', error);
        setIsWalletLinked(false);
      }
    };

    checkWalletLink();
  }, [user, address]);

  // Update ASTRA balance when token balance changes
  useEffect(() => {
    if (tokenBalance) {
      setAstraBalance(formatUnits(tokenBalance.value, tokenBalance.decimals));
    } else {
      setAstraBalance(null);
    }
  }, [tokenBalance]);

  const connectWallet = () => {
    // This will be handled by the Web3Modal component
    console.log('Connect wallet triggered');
  };

  const disconnectWallet = () => {
    disconnect();
    setIsWalletLinked(false);
    setAstraBalance(null);
  };

  const linkWalletToProfile = async () => {
    if (!user || !address) {
      throw new Error('User not authenticated or wallet not connected');
    }

    try {
      await linkWalletToUser(user.id, address, 56);
      setIsWalletLinked(true);
      console.log('Wallet linked successfully');
    } catch (error) {
      console.error('Error linking wallet:', error);
      throw error;
    }
  };

  const value = {
    isConnected,
    address,
    balance: balance ? formatUnits(balance.value, balance.decimals) : null,
    astraBalance,
    isLoading,
    connectWallet,
    disconnectWallet,
    linkWalletToProfile,
    isWalletLinked,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
