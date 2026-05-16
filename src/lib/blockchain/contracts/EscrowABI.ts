// PropertyEscrow Smart Contract ABI
// Custom contract for automated real estate escrow payments

export const ESCROW_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'escrowId', type: 'bytes32' },
      { indexed: true, name: 'buyer', type: 'address' },
      { indexed: true, name: 'seller', type: 'address' },
      { indexed: false, name: 'propertyId', type: 'string' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'EscrowCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'escrowId', type: 'bytes32' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'EscrowFunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'escrowId', type: 'bytes32' },
      { indexed: false, name: 'sellerAmount', type: 'uint256' },
      { indexed: false, name: 'commissionAmount', type: 'uint256' },
    ],
    name: 'EscrowReleased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'escrowId', type: 'bytes32' },
      { indexed: false, name: 'reason', type: 'string' },
    ],
    name: 'EscrowRefunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'escrowId', type: 'bytes32' },
      { indexed: true, name: 'disputeRaiser', type: 'address' },
      { indexed: false, name: 'reason', type: 'string' },
    ],
    name: 'DisputeRaised',
    type: 'event',
  },

  // Read Functions
  {
    inputs: [{ name: 'escrowId', type: 'bytes32' }],
    name: 'getEscrow',
    outputs: [
      {
        components: [
          { name: 'buyer', type: 'address' },
          { name: 'seller', type: 'address' },
          { name: 'agent', type: 'address' },
          { name: 'propertyId', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'commissionRate', type: 'uint256' },
          { name: 'fundedAmount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserEscrows',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'platformFeeRate',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Write Functions
  {
    inputs: [
      { name: 'seller', type: 'address' },
      { name: 'agent', type: 'address' },
      { name: 'propertyId', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'commissionRate', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'createEscrow',
    outputs: [{ name: 'escrowId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'escrowId', type: 'bytes32' }],
    name: 'fundEscrow',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'escrowId', type: 'bytes32' }],
    name: 'releaseEscrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'escrowId', type: 'bytes32' },
      { name: 'reason', type: 'string' },
    ],
    name: 'refundEscrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'escrowId', type: 'bytes32' },
      { name: 'reason', type: 'string' },
    ],
    name: 'raiseDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'escrowId', type: 'bytes32' },
      { name: 'buyerPercentage', type: 'uint256' },
    ],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Escrow Status Enum
export enum EscrowStatus {
  Created = 0,
  Funded = 1,
  Released = 2,
  Refunded = 3,
  Disputed = 4,
  Resolved = 5,
}

export const getEscrowStatusLabel = (status: EscrowStatus): string => {
  const labels: Record<EscrowStatus, string> = {
    [EscrowStatus.Created]: 'Created',
    [EscrowStatus.Funded]: 'Funded',
    [EscrowStatus.Released]: 'Released',
    [EscrowStatus.Refunded]: 'Refunded',
    [EscrowStatus.Disputed]: 'Disputed',
    [EscrowStatus.Resolved]: 'Resolved',
  };
  return labels[status];
};
