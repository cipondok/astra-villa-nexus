// PropertyToken Smart Contract ABI
// ERC-1155 based fractional property ownership tokens

export const PROPERTY_TOKEN_ABI = [
  // ERC-1155 Standard Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'operator', type: 'address' },
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'id', type: 'uint256' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'TransferSingle',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'operator', type: 'address' },
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'ids', type: 'uint256[]' },
      { indexed: false, name: 'values', type: 'uint256[]' },
    ],
    name: 'TransferBatch',
    type: 'event',
  },

  // Custom Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'propertyId', type: 'string' },
      { indexed: false, name: 'totalShares', type: 'uint256' },
      { indexed: false, name: 'pricePerShare', type: 'uint256' },
    ],
    name: 'PropertyTokenized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'buyer', type: 'address' },
      { indexed: false, name: 'shares', type: 'uint256' },
      { indexed: false, name: 'totalPaid', type: 'uint256' },
    ],
    name: 'SharesPurchased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'totalDividend', type: 'uint256' },
      { indexed: false, name: 'perShareDividend', type: 'uint256' },
    ],
    name: 'DividendDistributed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'holder', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'DividendClaimed',
    type: 'event',
  },

  // Read Functions
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getPropertyToken',
    outputs: [
      {
        components: [
          { name: 'propertyId', type: 'string' },
          { name: 'totalShares', type: 'uint256' },
          { name: 'availableShares', type: 'uint256' },
          { name: 'pricePerShare', type: 'uint256' },
          { name: 'propertyValue', type: 'uint256' },
          { name: 'minInvestment', type: 'uint256' },
          { name: 'maxInvestment', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'isSoldOut', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'holder', type: 'address' },
    ],
    name: 'getHolderInfo',
    outputs: [
      {
        components: [
          { name: 'shares', type: 'uint256' },
          { name: 'ownershipPercentage', type: 'uint256' },
          { name: 'totalInvested', type: 'uint256' },
          { name: 'unclaimedDividends', type: 'uint256' },
          { name: 'totalDividendsClaimed', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getHolders',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'holder', type: 'address' }],
    name: 'getHolderTokens',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'propertyId', type: 'string' }],
    name: 'getTokenIdByPropertyId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Write Functions
  {
    inputs: [
      { name: 'propertyId', type: 'string' },
      { name: 'totalShares', type: 'uint256' },
      { name: 'pricePerShare', type: 'uint256' },
      { name: 'propertyValue', type: 'uint256' },
      { name: 'minInvestment', type: 'uint256' },
      { name: 'maxInvestment', type: 'uint256' },
      { name: 'metadataURI', type: 'string' },
    ],
    name: 'tokenizeProperty',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'shares', type: 'uint256' },
    ],
    name: 'purchaseShares',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'distributeDividend',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'claimDividend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
    name: 'setTokenActive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export interface PropertyTokenInfo {
  propertyId: string;
  totalShares: bigint;
  availableShares: bigint;
  pricePerShare: bigint;
  propertyValue: bigint;
  minInvestment: bigint;
  maxInvestment: bigint;
  isActive: boolean;
  isSoldOut: boolean;
  createdAt: bigint;
}

export interface HolderInfo {
  shares: bigint;
  ownershipPercentage: bigint;
  totalInvested: bigint;
  unclaimedDividends: bigint;
  totalDividendsClaimed: bigint;
}
