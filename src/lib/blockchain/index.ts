// Blockchain Module - Polygon Smart Contracts Integration
// Export all blockchain-related functionality

// Configuration
export * from './config';

// Contract ABIs
export * from './contracts/EscrowABI';
export * from './contracts/PropertyDeedABI';
export * from './contracts/PropertyTokenABI';
export * from './contracts/CommissionABI';

// Hooks
export { useWallet } from './hooks/useWallet';
export { useEscrow } from './hooks/useEscrow';
export { usePropertyToken } from './hooks/usePropertyToken';

// Re-export wagmi hooks for convenience
export {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
