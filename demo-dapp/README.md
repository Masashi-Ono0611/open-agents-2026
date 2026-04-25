# Simple Voting DApp — Base Sepolia

On-chain voting demo built with Next.js 15, Hardhat, and deployed to Base Sepolia.

## Stack

| Layer | Tech |
|-------|------|
| Smart Contract | Solidity 0.8.20, Hardhat |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem, RainbowKit |
| Chain | Base Sepolia (chainId: 84532) |

## Features

- Connect wallet via RainbowKit (MetaMask, Coinbase Wallet, etc.)
- View all proposals with live vote counts and progress bars
- One vote per address (enforced on-chain)
- Contract owner can create new proposals
- Toast notifications on success/error

## Quick Start

### 1. Deploy the contract

```bash
cd contracts
bun install
cp .env.example .env
# Edit .env — set PRIVATE_KEY to your wallet private key

bun run deploy:baseSepolia
# Note the deployed contract address
```

### 2. Set the contract address

Edit `frontend/lib/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS" as `0x${string}`;
```

### 3. Run the frontend

```bash
cd frontend
bun install
cp .env.example .env.local
# Edit .env.local — add your WalletConnect Project ID
# Get one free at: https://cloud.walletconnect.com

bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testnet Resources

- **ETH Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Block Explorer**: https://sepolia.basescan.org
- **RPC URL**: https://sepolia.base.org

## Contract

```
SimpleVoting.sol
├── createProposal(string name)  — owner only
├── vote(uint256 proposalId)     — one per address
├── getProposals()               — returns all proposals
└── hasVoted(address)            — check vote status
```
