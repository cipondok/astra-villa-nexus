
import { createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

// Web3Modal project ID - you should replace this with your actual project ID
const projectId = 'demo-project-id-replace-with-real-one';

export const config = createConfig({
  chains: [bscTestnet, bsc], // Put testnet first for development
  connectors: [
    injected(), // MetaMask, Brave, etc.
    walletConnect({ 
      projectId,
      metadata: {
        name: 'ASTRA Villa Realty',
        description: 'Real Estate Platform with ASTRA Tokens',
        url: 'https://astra-villa-realty.com',
        icons: ['https://astra-villa-realty.com/favicon.ico']
      }
    }),
    coinbaseWallet({ 
      appName: 'ASTRA Villa Realty',
      appLogoUrl: 'https://astra-villa-realty.com/favicon.ico'
    }),
  ],
  transports: {
    [bsc.id]: http('https://bsc-dataseed1.binance.org/'),
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545/'),
  },
});

// ASTRA Token Contract Configuration
// TODO: Replace with your actual deployed ASTRA token contract addresses
export const ASTRA_TOKEN_CONFIG = {
  // BSC Mainnet (update with your actual deployed contract address)
  mainnet: {
    address: 'YOUR_MAINNET_CONTRACT_ADDRESS' as `0x${string}`,
    chainId: 56,
    name: 'ASTRA Token',
    symbol: 'ASTRA',
    decimals: 18,
  },
  // BSC Testnet (for development - replace with your testnet contract)
  testnet: {
    address: 'YOUR_TESTNET_CONTRACT_ADDRESS' as `0x${string}`,
    chainId: 97,
    name: 'ASTRA Token (Testnet)',
    symbol: 'ASTRA',
    decimals: 18,
  }
};

// Current ASTRA Token Address (use testnet for development, mainnet for production)
// TODO: Update this with your actual contract address
export const ASTRA_TOKEN_ADDRESS = ASTRA_TOKEN_CONFIG.testnet.address;

// Enhanced ASTRA Token ABI - Update this with your actual contract ABI
export const ASTRA_TOKEN_ABI = [
  // Basic ERC20 functions
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  // Allowance functions
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  // Add any custom functions from your ASTRA token contract here
  // Example: if your token has minting, burning, or other special functions
];

// Utility functions for ASTRA token
export const formatAstraAmount = (amount: bigint, decimals: number = 18): string => {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  
  if (fraction === 0n) {
    return whole.toString();
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmedFraction = fractionStr.replace(/0+$/, '');
  
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole.toString();
};

export const parseAstraAmount = (amount: string, decimals: number = 18): bigint => {
  const [whole, fraction = ''] = amount.split('.');
  const wholeBigInt = BigInt(whole || '0');
  const fractionBigInt = BigInt(fraction.padEnd(decimals, '0').slice(0, decimals));
  
  return wholeBigInt * BigInt(10 ** decimals) + fractionBigInt;
};

// Helper function to check if token address is configured
export const isTokenConfigured = (): boolean => {
  return ASTRA_TOKEN_ADDRESS !== 'YOUR_TESTNET_CONTRACT_ADDRESS' && 
         ASTRA_TOKEN_ADDRESS !== 'YOUR_MAINNET_CONTRACT_ADDRESS' &&
         ASTRA_TOKEN_ADDRESS !== '0x0000000000000000000000000000000000000000';
};
