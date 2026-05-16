import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { useCallback, useMemo } from 'react';

export const useWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const { data: balance } = useBalance({
    address,
  });

  const isPolygon = useMemo(() => {
    return chainId === polygon.id || chainId === polygonAmoy.id;
  }, [chainId]);

  const isMainnet = useMemo(() => chainId === polygon.id, [chainId]);
  const isTestnet = useMemo(() => chainId === polygonAmoy.id, [chainId]);

  const connectWallet = useCallback(async (connectorId?: string) => {
    const connector = connectorId 
      ? connectors.find(c => c.id === connectorId)
      : connectors[0];
    
    if (connector) {
      connect({ connector });
    }
  }, [connect, connectors]);

  const switchToPolygon = useCallback(async (testnet = false) => {
    const targetChainId = testnet ? polygonAmoy.id : polygon.id;
    switchChain({ chainId: targetChainId });
  }, [switchChain]);

  const formatBalance = useCallback((decimals = 4) => {
    if (!balance) return '0';
    return parseFloat(balance.formatted).toFixed(decimals);
  }, [balance]);

  const shortenAddress = useCallback((addr?: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  return {
    // Connection state
    address,
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    
    // Chain state
    chainId,
    isPolygon,
    isMainnet,
    isTestnet,
    isSwitchingChain,
    
    // Balance
    balance,
    formatBalance,
    
    // Connectors
    connectors,
    
    // Actions
    connectWallet,
    disconnect,
    switchToPolygon,
    
    // Utils
    shortenAddress,
  };
};

export default useWallet;
