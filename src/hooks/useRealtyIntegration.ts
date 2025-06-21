
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { realtySupabase } from '@/integrations/realty-supabase/client';
import { supabase } from '@/integrations/supabase/client';

interface RealtyUser {
  id: string;
  email: string;
  full_name?: string;
  wallet_address?: string;
  astra_balance?: number;
}

export const useRealtyIntegration = () => {
  const { user, profile } = useAuth();
  const { address, astraBalance } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [realtyUser, setRealtyUser] = useState<RealtyUser | null>(null);

  // Sync user data to Realty database
  const syncToRealty = async () => {
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      const userData = {
        id: user.id,
        email: user.email!,
        full_name: profile.full_name,
        wallet_address: address,
        astra_balance: parseFloat(astraBalance || '0'),
        updated_at: new Date().toISOString()
      };

      // First, try to upsert the user in the Realty database
      const { error } = await realtySupabase
        .from('users')
        .upsert(userData);

      if (error) {
        console.error('Error syncing to Realty database:', error);
        throw error;
      }

      setRealtyUser(userData);
      console.log('Successfully synced user to Realty database');
    } catch (error) {
      console.error('Failed to sync to Realty database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get Realty project URL with user data
  const getRealtyProjectUrl = (baseUrl: string) => {
    if (!realtyUser) return baseUrl;

    const userData = encodeURIComponent(JSON.stringify(realtyUser));
    return `${baseUrl}?user=${userData}`;
  };

  // Auto-sync when user data changes
  useEffect(() => {
    if (user && profile && address) {
      syncToRealty();
    }
  }, [user, profile, address, astraBalance]);

  return {
    isLoading,
    realtyUser,
    syncToRealty,
    getRealtyProjectUrl
  };
};
