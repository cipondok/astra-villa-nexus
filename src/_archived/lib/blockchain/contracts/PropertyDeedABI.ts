// PropertyDeed NFT Smart Contract ABI
// ERC-721 based digital property deeds with metadata

export const PROPERTY_DEED_ABI = [
  // ERC-721 Standard Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'approved', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },

  // Custom Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'propertyId', type: 'string' },
      { indexed: false, name: 'owner', type: 'address' },
      { indexed: false, name: 'documentHash', type: 'bytes32' },
    ],
    name: 'DeedMinted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'transactionHash', type: 'bytes32' },
    ],
    name: 'DeedTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'verifier', type: 'address' },
      { indexed: false, name: 'verified', type: 'bool' },
    ],
    name: 'DeedVerified',
    type: 'event',
  },

  // Read Functions
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getDeed',
    outputs: [
      {
        components: [
          { name: 'propertyId', type: 'string' },
          { name: 'documentHash', type: 'bytes32' },
          { name: 'legalDescription', type: 'string' },
          { name: 'registryNumber', type: 'string' },
          { name: 'isVerified', type: 'bool' },
          { name: 'verifiedBy', type: 'address' },
          { name: 'mintedAt', type: 'uint256' },
          { name: 'lastTransferAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
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
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getTransferHistory',
    outputs: [
      {
        components: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'transactionHash', type: 'bytes32' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'price', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Write Functions
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'propertyId', type: 'string' },
      { name: 'documentHash', type: 'bytes32' },
      { name: 'legalDescription', type: 'string' },
      { name: 'registryNumber', type: 'string' },
      { name: 'metadataURI', type: 'string' },
    ],
    name: 'mintDeed',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'verified', type: 'bool' },
    ],
    name: 'verifyDeed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'newDocumentHash', type: 'bytes32' },
      { name: 'newMetadataURI', type: 'string' },
    ],
    name: 'updateDeedMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export interface DeedMetadata {
  propertyId: string;
  documentHash: string;
  legalDescription: string;
  registryNumber: string;
  isVerified: boolean;
  verifiedBy: string;
  mintedAt: bigint;
  lastTransferAt: bigint;
}

export interface TransferRecord {
  from: string;
  to: string;
  transactionHash: string;
  timestamp: bigint;
  price: bigint;
}
