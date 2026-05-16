
// Simplified web3 utilities without ASTRA token functionality
export const formatEthAmount = (amount: string | number): string => {
  return `${amount} ETH`;
};

export const DEFAULT_CHAIN_ID = 1; // Ethereum mainnet

// Basic config placeholder
export const config = {
  chains: [],
  connectors: [],
  transports: {}
};
