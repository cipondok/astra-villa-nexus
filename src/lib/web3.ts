
// Basic web3 constants and utilities
export const ASTRA_TOKEN_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "type": "function"
  }
] as const;

export const DEFAULT_CHAIN_ID = 1; // Ethereum mainnet

// Mock config for compatibility
export const config = {
  chains: [],
  connectors: [],
  transports: {}
};

export const formatAstraAmount = (amount: string | number): string => {
  return `${amount} ASTRA`;
};
