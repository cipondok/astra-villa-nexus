import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { useCallback, useMemo } from 'react';
import { ESCROW_ABI, EscrowStatus, getEscrowStatusLabel } from '../contracts/EscrowABI';
import { getContractAddress, parsePolygonAmount, formatPolygonAmount, SUPPORTED_CHAINS } from '../config';

export interface CreateEscrowParams {
  seller: `0x${string}`;
  agent: `0x${string}`;
  propertyId: string;
  amount: string; // In MATIC
  commissionRate: number; // Percentage (e.g., 5 for 5%)
  deadlineDays: number;
}

export interface EscrowData {
  buyer: string;
  seller: string;
  agent: string;
  propertyId: string;
  amount: bigint;
  commissionRate: bigint;
  fundedAmount: bigint;
  status: EscrowStatus;
  statusLabel: string;
  createdAt: bigint;
  deadline: bigint;
}

export const useEscrow = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const contractAddress = getContractAddress('escrow', chainId) as `0x${string}`;
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId) || SUPPORTED_CHAINS[0];

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read escrow by ID
  const useGetEscrow = (escrowId?: `0x${string}`) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: contractAddress,
      abi: ESCROW_ABI,
      functionName: 'getEscrow',
      args: escrowId ? [escrowId] : undefined,
      query: {
        enabled: !!escrowId,
      },
    });

    const escrowData: EscrowData | null = useMemo(() => {
      if (!data) return null;
      const [buyer, seller, agent, propertyId, amount, commissionRate, fundedAmount, status, createdAt, deadline] = data as any;
      return {
        buyer,
        seller,
        agent,
        propertyId,
        amount,
        commissionRate,
        fundedAmount,
        status: status as EscrowStatus,
        statusLabel: getEscrowStatusLabel(status as EscrowStatus),
        createdAt,
        deadline,
      };
    }, [data]);

    return { escrowData, isLoading, error, refetch };
  };

  // Get user's escrows
  const useGetUserEscrows = (userAddress?: `0x${string}`) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: contractAddress,
      abi: ESCROW_ABI,
      functionName: 'getUserEscrows',
      args: userAddress ? [userAddress] : undefined,
      query: {
        enabled: !!userAddress,
      },
    });

    return { escrowIds: data as `0x${string}`[] | undefined, isLoading, error, refetch };
  };

  // Create escrow
  const createEscrow = useCallback(async (params: CreateEscrowParams) => {
    if (!address) throw new Error('Wallet not connected');
    
    const amountWei = parsePolygonAmount(params.amount);
    const commissionRateBps = BigInt(params.commissionRate * 100); // Convert to basis points
    const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + params.deadlineDays * 24 * 60 * 60);

    writeContract({
      address: contractAddress,
      abi: ESCROW_ABI,
      functionName: 'createEscrow',
      args: [
        params.seller,
        params.agent,
        params.propertyId,
        amountWei,
        commissionRateBps,
        deadlineTimestamp,
      ],
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  // Fund escrow
  const fundEscrow = useCallback(async (escrowId: `0x${string}`, amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    const amountWei = parsePolygonAmount(amount);

    writeContract({
      address: contractAddress,
      abi: ESCROW_ABI,
      functionName: 'fundEscrow',
      args: [escrowId],
      value: amountWei,
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  // Release escrow
  const releaseEscrow = useCallback(async (escrowId: `0x${string}`) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: contractAddress,
      abi: ESCROW_ABI,
      functionName: 'releaseEscrow',
      args: [escrowId],
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  // Refund escrow
  const refundEscrow = useCallback(async (escrowId: `0x${string}`, reason: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: contractAddress,
      abi: ESCROW_ABI,
      functionName: 'refundEscrow',
      args: [escrowId, reason],
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  // Raise dispute
  const raiseDispute = useCallback(async (escrowId: `0x${string}`, reason: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: contractAddress,
      abi: ESCROW_ABI,
      functionName: 'raiseDispute',
      args: [escrowId, reason],
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  return {
    // Read hooks
    useGetEscrow,
    useGetUserEscrows,
    
    // Write functions
    createEscrow,
    fundEscrow,
    releaseEscrow,
    refundEscrow,
    raiseDispute,
    
    // Transaction state
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    
    // Contract info
    contractAddress,
    chainId,
    
    // Utils
    formatAmount: formatPolygonAmount,
    parseAmount: parsePolygonAmount,
  };
};

export default useEscrow;
