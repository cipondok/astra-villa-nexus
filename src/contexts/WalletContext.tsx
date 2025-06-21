
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useAstraToken } from '@/hooks/useAstraToken';

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
  const { user, isAuthenticated } = useAuth();
  const { balance } = useAstraToken();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [isWalletLinked, setIsWalletLinked] = useState(false);

  // Auto-connect for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      // Generate a simple wallet address based on user ID
      const walletAddress = `0xastra${user.id.replace(/-/g, '').slice(0, 32)}`;
      setAddress(walletAddress);
      setIsConnected(true);
      setIsWalletLinked(true);
    } else {
      setAddress(undefined);
      setIsConnected(false);
      setIsWalletLinked(false);
    }
  }, [isAuthenticated, user]);

  const connectWallet = () => {
    if (isAuthenticated && user) {
      const walletAddress = `0xastra${user.id.replace(/-/g, '').slice(0, 32)}`;
      setAddress(walletAddress);
      setIsConnected(true);
      setIsWalletLinked(true);
    }
  };

  const disconnectWallet = () => {
    setAddress(undefined);
    setIsConnected(false);
    setIsWalletLinked(false);
  };

  const linkWalletToProfile = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    setIsWalletLinked(true);
  };

  const value = {
    isConnected,
    address,
    balance: null, // Not using native currency
    astraBalance: balance?.toString() || null,
    isLoading: false,
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
