// CommissionDistributor Smart Contract ABI
// Transparent commission distribution with immutable records

export const COMMISSION_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'transactionId', type: 'bytes32' },
      { indexed: true, name: 'propertyId', type: 'string' },
      { indexed: false, name: 'totalAmount', type: 'uint256' },
      { indexed: false, name: 'participants', type: 'uint256' },
    ],
    name: 'CommissionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'transactionId', type: 'bytes32' },
      { indexed: true, name: 'recipient', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'role', type: 'string' },
    ],
    name: 'CommissionDistributed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'transactionId', type: 'bytes32' },
      { indexed: true, name: 'recipient', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'CommissionClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'agent', type: 'address' },
      { indexed: false, name: 'isActive', type: 'bool' },
    ],
    name: 'AgentStatusChanged',
    type: 'event',
  },

  // Read Functions
  {
    inputs: [{ name: 'transactionId', type: 'bytes32' }],
    name: 'getCommission',
    outputs: [
      {
        components: [
          { name: 'propertyId', type: 'string' },
          { name: 'salePrice', type: 'uint256' },
          { name: 'totalCommission', type: 'uint256' },
          { name: 'platformFee', type: 'uint256' },
          { name: 'isDistributed', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'distributedAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'transactionId', type: 'bytes32' }],
    name: 'getCommissionBreakdown',
    outputs: [
      {
        components: [
          { name: 'recipient', type: 'address' },
          { name: 'role', type: 'string' },
          { name: 'percentage', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'isClaimed', type: 'bool' },
          { name: 'claimedAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'agent', type: 'address' }],
    name: 'getAgentStats',
    outputs: [
      {
        components: [
          { name: 'totalTransactions', type: 'uint256' },
          { name: 'totalEarnings', type: 'uint256' },
          { name: 'pendingEarnings', type: 'uint256' },
          { name: 'claimedEarnings', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'registeredAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'agent', type: 'address' }],
    name: 'getPendingCommissions',
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
  {
    inputs: [],
    name: 'totalDistributed',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Write Functions
  {
    inputs: [
      { name: 'propertyId', type: 'string' },
      { name: 'salePrice', type: 'uint256' },
      { name: 'commissionRate', type: 'uint256' },
      {
        components: [
          { name: 'recipient', type: 'address' },
          { name: 'role', type: 'string' },
          { name: 'percentage', type: 'uint256' },
        ],
        name: 'participants',
        type: 'tuple[]',
      },
    ],
    name: 'createCommission',
    outputs: [{ name: 'transactionId', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'transactionId', type: 'bytes32' }],
    name: 'distributeCommission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'transactionId', type: 'bytes32' }],
    name: 'claimCommission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimAllPending',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'agent', type: 'address' }],
    name: 'registerAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'isActive', type: 'bool' },
    ],
    name: 'setAgentStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export interface CommissionInfo {
  propertyId: string;
  salePrice: bigint;
  totalCommission: bigint;
  platformFee: bigint;
  isDistributed: boolean;
  createdAt: bigint;
  distributedAt: bigint;
}

export interface CommissionParticipant {
  recipient: string;
  role: string;
  percentage: bigint;
  amount: bigint;
  isClaimed: boolean;
  claimedAt: bigint;
}

export interface AgentStats {
  totalTransactions: bigint;
  totalEarnings: bigint;
  pendingEarnings: bigint;
  claimedEarnings: bigint;
  isActive: boolean;
  registeredAt: bigint;
}
