
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Web3AuthState {
  isConnecting: boolean;
  isWalletLinked: boolean;
  error: string | null;
}

export const useWeb3Auth = () => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, signIn, signUp, profile, refreshProfile } = useAuth();
  
  const [state, setState] = useState<Web3AuthState>({
    isConnecting: false,
    isWalletLinked: false,
    error: null,
  });

  // Check if wallet is linked to current user
  useEffect(() => {
    const checkWalletLink = async () => {
      if (!user || !address) {
        setState(prev => ({ ...prev, isWalletLinked: false }));
        return;
      }

      try {
        const { data } = await supabase
          .from('wallet_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('wallet_address', address.toLowerCase())
          .single();

        setState(prev => ({ ...prev, isWalletLinked: !!data }));
      } catch (error) {
        setState(prev => ({ ...prev, isWalletLinked: false }));
      }
    };

    checkWalletLink();
  }, [user, address]);

  // Auto-login when wallet connects
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (!isConnected || !address || user) return;

      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      try {
        // Check if wallet is already linked to any user
        const { data: existingConnection } = await supabase
          .from('wallet_connections')
          .select('user_id, profiles!inner(*)')
          .eq('wallet_address', address.toLowerCase())
          .single();

        if (existingConnection) {
          // Auto-sign in existing user
          const email = existingConnection.profiles.email;
          const { error } = await signIn(email, address); // Use wallet address as password
          
          if (!error) {
            toast.success('Wallet connected! Welcome back.');
          } else {
            throw new Error('Failed to authenticate with existing wallet');
          }
        } else {
          // Create new user profile with wallet
          await createWalletUser();
        }
      } catch (error) {
        console.error('Wallet connection error:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to connect wallet. Please try again.' 
        }));
        toast.error('Failed to connect wallet');
        disconnect();
      } finally {
        setState(prev => ({ ...prev, isConnecting: false }));
      }
    };

    handleWalletConnection();
  }, [isConnected, address, user]);

  const createWalletUser = async () => {
    if (!address || !connector) return;

    const email = `${address.toLowerCase()}@wallet.astra`;
    const displayName = `${connector.name} User ${address.slice(0, 6)}...${address.slice(-4)}`;

    const { error } = await signUp(email, address, displayName);
    
    if (error && !error.message?.includes('User already registered')) {
      throw error;
    }

    // Link wallet to the new/existing user
    await linkWalletToProfile();
    toast.success('Wallet connected! Your account has been created.');
  };

  const linkWalletToProfile = async () => {
    if (!user || !address || !connector) {
      throw new Error('Missing required data for wallet linking');
    }

    const { error } = await supabase
      .from('wallet_connections')
      .upsert({
        user_id: user.id,
        wallet_address: address.toLowerCase(),
        wallet_provider: connector.name,
        is_verified: true,
        last_used_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Update profile with wallet info
    await supabase
      .from('profiles')
      .update({
        wallet_address: address.toLowerCase(),
        wallet_provider: connector.name,
        wallet_verified: true,
      })
      .eq('id', user.id);

    await refreshProfile();
    setState(prev => ({ ...prev, isWalletLinked: true }));
  };

  const connectWallet = useCallback((connectorId?: string) => {
    const targetConnector = connectorId 
      ? connectors.find(c => c.id === connectorId)
      : connectors[0];

    if (targetConnector) {
      connect({ connector: targetConnector });
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setState(prev => ({ 
      ...prev, 
      isWalletLinked: false, 
      error: null 
    }));
    toast.info('Wallet disconnected');
  }, [disconnect]);

  const formatAddress = useCallback((addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  return {
    // Wallet state
    address,
    isConnected,
    connector,
    
    // Connection state
    isConnecting: state.isConnecting || isPending,
    isWalletLinked: state.isWalletLinked,
    error: state.error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    linkWalletToProfile,
    formatAddress,
    
    // Available connectors
    connectors,
  };
};
