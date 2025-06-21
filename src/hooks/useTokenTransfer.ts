
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ASTRA_TOKEN_ADDRESS, ASTRA_TOKEN_ABI } from '@/lib/web3';
import { toast } from 'sonner';

interface TransferParams {
  to: string;
  amount: string;
}

export const useTokenTransfer = () => {
  const { address } = useAccount();
  const [isTransferring, setIsTransferring] = useState(false);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transferTokens = async ({ to, amount }: TransferParams) => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    if (ASTRA_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      toast.error('ASTRA token contract not configured');
      return;
    }

    try {
      setIsTransferring(true);
      
      const parsedAmount = parseUnits(amount, 18);
      
      writeContract({
        address: ASTRA_TOKEN_ADDRESS,
        abi: ASTRA_TOKEN_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, parsedAmount],
      });

      toast.success('Transfer initiated');
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Failed to initiate transfer');
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transferTokens,
    isTransferring: isTransferring || isPending,
    isConfirming,
    isSuccess,
    transactionHash: hash,
  };
};
