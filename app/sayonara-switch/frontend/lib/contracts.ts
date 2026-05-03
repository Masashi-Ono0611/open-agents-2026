// Update VAULT_ADDRESS after running:
//   cd contracts && bun run deploy:baseSepolia
// TOKEN_ADDRESS is Circle's official USDC on Base Sepolia.
// Faucet: https://faucet.circle.com/
export const VAULT_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;
export const TOKEN_ADDRESS =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;
export const TOKEN_SYMBOL = "USDC";

export const VAULT_ABI = [
  {
    inputs: [
      { name: "heir", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "willNoteHash", type: "bytes32" },
      { name: "timeout", type: "uint64" },
    ],
    name: "commit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "heartbeat",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "revoke",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "wills",
    outputs: [
      { name: "heir", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "willNoteHash", type: "bytes32" },
      { name: "timeout", type: "uint64" },
      { name: "lastHeartbeat", type: "uint64" },
      { name: "executed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "silenceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "isExpired",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "heir", type: "address" },
      { indexed: true, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "willNoteHash", type: "bytes32" },
      { indexed: false, name: "timeout", type: "uint64" },
    ],
    name: "WillCommitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "timestamp", type: "uint64" },
    ],
    name: "Heartbeat",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "heir", type: "address" },
      { indexed: true, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "willNoteHash", type: "bytes32" },
    ],
    name: "Sayonara",
    type: "event",
  },
] as const;

export const TOKEN_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const TOKEN_DECIMALS = 6;
