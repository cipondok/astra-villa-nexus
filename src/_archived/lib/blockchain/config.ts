// Polygon Blockchain Configuration
import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect Project ID - Users should replace with their own
const WALLET_CONNECT_PROJECT_ID = 'astra-villa-realty';

export const wagmiConfig = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [
    injected(),
    walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

// Contract Addresses (Deploy these contracts and update addresses)
export const CONTRACT_ADDRESSES = {
  polygon: {
    escrow: '0x0000000000000000000000000000000000000000', // Deploy and update
    propertyDeed: '0x0000000000000000000000000000000000000000',
    propertyToken: '0x0000000000000000000000000000000000000000',
    commission: '0x0000000000000000000000000000000000000000',
  },
  polygonAmoy: {
    escrow: '0x0000000000000000000000000000000000000000', // Testnet addresses
    propertyDeed: '0x0000000000000000000000000000000000000000',
    propertyToken: '0x0000000000000000000000000000000000000000',
    commission: '0x0000000000000000000000000000000000000000',
  },
} as const;

export const SUPPORTED_CHAINS = [polygon, polygonAmoy] as const;

export const getContractAddress = (
  contractName: keyof typeof CONTRACT_ADDRESSES.polygon,
  chainId: number
) => {
  if (chainId === polygon.id) {
    return CONTRACT_ADDRESSES.polygon[contractName];
  }
  return CONTRACT_ADDRESSES.polygonAmoy[contractName];
};

export const formatPolygonAmount = (amount: bigint, decimals = 18): string => {
  const value = Number(amount) / Math.pow(10, decimals);
  return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
};

export const parsePolygonAmount = (amount: string, decimals = 18): bigint => {
  const value = parseFloat(amount) * Math.pow(10, decimals);
  return BigInt(Math.floor(value));
};
