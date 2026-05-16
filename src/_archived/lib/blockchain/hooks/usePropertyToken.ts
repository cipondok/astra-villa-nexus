import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { useCallback, useMemo } from 'react';
import { PROPERTY_TOKEN_ABI, PropertyTokenInfo, HolderInfo } from '../contracts/PropertyTokenABI';
import { getContractAddress, parsePolygonAmount, formatPolygonAmount, SUPPORTED_CHAINS } from '../config';

export interface TokenizePropertyParams {
  propertyId: string;
  totalShares: number;
  pricePerShare: string; // In MATIC
  propertyValue: string; // In MATIC
  minInvestment: string; // In MATIC
  maxInvestment: string; // In MATIC
  metadataURI: string;
}

export const usePropertyToken = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const contractAddress = getContractAddress('propertyToken', chainId) as `0x${string}`;
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId) || SUPPORTED_CHAINS[0];

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get property token info
  const useGetPropertyToken = (tokenId?: bigint) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'getPropertyToken',
      args: tokenId !== undefined ? [tokenId] : undefined,
      query: {
        enabled: tokenId !== undefined,
      },
    });

    const tokenInfo: PropertyTokenInfo | null = useMemo(() => {
      if (!data) return null;
      return data as PropertyTokenInfo;
    }, [data]);

    return { tokenInfo, isLoading, error, refetch };
  };

  // Get holder info
  const useGetHolderInfo = (tokenId?: bigint, holderAddress?: `0x${string}`) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'getHolderInfo',
      args: tokenId !== undefined && holderAddress ? [tokenId, holderAddress] : undefined,
      query: {
        enabled: tokenId !== undefined && !!holderAddress,
      },
    });

    const holderInfo: HolderInfo | null = useMemo(() => {
      if (!data) return null;
      return data as HolderInfo;
    }, [data]);

    return { holderInfo, isLoading, error, refetch };
  };

  // Get holder's tokens
  const useGetHolderTokens = (holderAddress?: `0x${string}`) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'getHolderTokens',
      args: holderAddress ? [holderAddress] : undefined,
      query: {
        enabled: !!holderAddress,
      },
    });

    return { tokenIds: data as bigint[] | undefined, isLoading, error, refetch };
  };

  // Get token ID by property ID
  const useGetTokenIdByPropertyId = (propertyId?: string) => {
    const { data, isLoading, error } = useReadContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'getTokenIdByPropertyId',
      args: propertyId ? [propertyId] : undefined,
      query: {
        enabled: !!propertyId,
      },
    });

    return { tokenId: data as bigint | undefined, isLoading, error };
  };

  // Tokenize property
  const tokenizeProperty = useCallback(async (params: TokenizePropertyParams) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'tokenizeProperty',
      args: [
        params.propertyId,
        BigInt(params.totalShares),
        parsePolygonAmount(params.pricePerShare),
        parsePolygonAmount(params.propertyValue),
        parsePolygonAmount(params.minInvestment),
        parsePolygonAmount(params.maxInvestment),
        params.metadataURI,
      ],
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  // Purchase shares
  const purchaseShares = useCallback(async (tokenId: bigint, shares: number, totalPrice: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'purchaseShares',
      args: [tokenId, BigInt(shares)],
      value: parsePolygonAmount(totalPrice),
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  // Transfer shares
  const transferShares = useCallback(async (
    from: `0x${string}`,
    to: `0x${string}`,
    tokenId: bigint,
    amount: number
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'safeTransferFrom',
      args: [from, to, tokenId, BigInt(amount), '0x' as `0x${string}`],
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  // Distribute dividend
  const distributeDividend = useCallback(async (tokenId: bigint, amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'distributeDividend',
      args: [tokenId],
      value: parsePolygonAmount(amount),
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  // Claim dividend
  const claimDividend = useCallback(async (tokenId: bigint) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: contractAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'claimDividend',
      args: [tokenId],
      account: address,
      chain,
    });
  }, [writeContract, contractAddress, address, chain]);

  return {
    // Read hooks
    useGetPropertyToken,
    useGetHolderInfo,
    useGetHolderTokens,
    useGetTokenIdByPropertyId,
    
    // Write functions
    tokenizeProperty,
    purchaseShares,
    transferShares,
    distributeDividend,
    claimDividend,
    
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

export default usePropertyToken;
