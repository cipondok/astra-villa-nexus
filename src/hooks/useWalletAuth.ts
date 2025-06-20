
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

export const useWalletAuth = () => {
  const { address, isConnected } = useAccount();
  const { user, signIn } = useAuth();
  const { linkWalletToProfile, isWalletLinked } = useWallet();
  const { showSuccess, showError } = useAlert();

  // Auto-create user profile on first wallet connection
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (!isConnected || !address || user) return;

      try {
        // Check if wallet is already linked to any user
        const { data: existingConnection } = await supabase
          .from('wallet_connections')
          .select('user_id, profiles!inner(*)')
          .eq('wallet_address', address.toLowerCase())
          .maybeSingle();

        if (existingConnection) {
          // Auto-sign in existing user
          showSuccess('Wallet Connected', 'Welcome back! Signing you in automatically.');
          return;
        }

        // Create new user profile with wallet
        const email = `${address.toLowerCase()}@wallet.local`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password: address, // Using wallet address as password for wallet-only accounts
          options: {
            data: {
              full_name: `Wallet User ${address.slice(0, 6)}...${address.slice(-4)}`,
              role: 'general_user',
              verification_status: 'approved',
              wallet_address: address.toLowerCase(),
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          showSuccess(
            'Profile Created', 
            'Your profile has been created and linked to your wallet!'
          );
        }
      } catch (error) {
        console.error('Error handling wallet connection:', error);
        showError('Connection Error', 'Failed to link wallet to profile');
      }
    };

    handleWalletConnection();
  }, [isConnected, address, user, showSuccess, showError]);

  // Link wallet to existing authenticated user
  const linkCurrentWallet = async () => {
    if (!user || !address) {
      showError('Error', 'Please sign in and connect your wallet first');
      return;
    }

    try {
      await linkWalletToProfile();
      showSuccess('Wallet Linked', 'Your wallet has been successfully linked to your profile');
    } catch (error) {
      showError('Link Failed', 'Failed to link wallet to your profile');
    }
  };

  return {
    isWalletLinked,
    linkCurrentWallet,
  };
};
