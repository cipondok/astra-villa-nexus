
import { supabase } from '@/integrations/supabase/client';

export interface WalletConnection {
  id: string;
  user_id: string;
  wallet_address: string;
  chain_id: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export const checkWalletConnection = async (userId: string, walletAddress: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('wallet_connections' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking wallet connection:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkWalletConnection:', error);
    return false;
  }
};

export const linkWalletToUser = async (userId: string, walletAddress: string, chainId: number = 56): Promise<void> => {
  const { error } = await supabase
    .from('wallet_connections' as any)
    .upsert({
      user_id: userId,
      wallet_address: walletAddress.toLowerCase(),
      chain_id: chainId,
      is_primary: true,
    });

  if (error) {
    throw new Error(`Failed to link wallet: ${error.message}`);
  }
};
