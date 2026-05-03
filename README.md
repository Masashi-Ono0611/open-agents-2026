# open-agents-2026

Built for [ETHGlobal Open Agents](https://ethglobal.com/events/openagents) (April 24 – May 6, 2026) — **KeeperHub track**.

## KeeperSake 🍶

> An on-chain keepsake, kept by a Keeper.

A triple pun: a *keepsake* (形見) you leave, *for the sake of* an heir, kept by a *Keeper* (the KeeperHub workflow watching your heartbeat).

Commit USDC + final words to an heir, set a timeout, tap **"I'm alive"** as long as you are. The day you stop, a KeeperHub workflow calls `execute()` on your behalf and your heir inherits — automatically, on-chain, no lawyer. The contract is permissionless; KeeperHub is the polite default.

→ Project lives in [`app/keepersake/`](./app/keepersake/). See:

- [`app/keepersake/README.md`](./app/keepersake/README.md) — full setup
- [`app/keepersake/docs/keeperhub-workflow.md`](./app/keepersake/docs/keeperhub-workflow.md) — the natural-language prompt that generates the watcher via `ai_generate_workflow`
- [`app/keepersake/FEEDBACK.md`](./app/keepersake/FEEDBACK.md) — Builder Feedback Bounty submission

## Deployment (Base Sepolia)

| Contract | Address |
|---|---|
| `KeeperSakeVault` | [`0x3A22bD29499702bEbc4225BfcDEAaE5DD8ae8743`](https://sepolia.basescan.org/address/0x3A22bD29499702bEbc4225BfcDEAaE5DD8ae8743) |
| USDC (Circle) | [`0x036CbD53842c5426634e7929541eC2318f3dCF7e`](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e) |

Faucets: [ETH](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) · [USDC](https://faucet.circle.com/) (pick Base Sepolia)

## Getting Started

```bash
cd app/keepersake/contracts
bun install && bun run test       # 8 tests pass
# bun run deploy:baseSepolia      # only if you want to redeploy

cd ../frontend
bun install
cp .env.example .env.local        # set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
bun run dev                       # http://localhost:3000
```

## Docs

- Hackathon: [overview](docs/hackathon/overview.md) · [prize details](docs/hackathon/prizes.md) · [schedule](docs/hackathon/schedule.md)
- Research: [AI agent trends](docs/research/ai-agent-trends.md) · [frameworks](docs/research/frameworks.md) · [on-chain agents](docs/research/onchain-agents.md)
