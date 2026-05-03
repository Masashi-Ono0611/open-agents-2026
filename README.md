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

## Claude Code skills (the agent-runtime side)

Two `.claude/skills/` shipped with this submission. Both call the **KeeperHub MCP server** directly — no frontend, no backend, just an English prompt → onchain action.

### 🍶 [`keeperhub-pilot`](./.claude/skills/keeperhub-pilot/SKILL.md)
> One prompt → one workflow → one tx.

Encodes the gotchas the KeeperSake build surfaced (network must be a chain-id string, tokenConfig must be a JSON string, integrationId is required, template syntax is `{{@id:Label.data.field}}`) so any developer or agent can invoke "send 0.5 USDC to alice" and get a tx hash back without re-discovering them. See [`examples/`](./.claude/skills/keeperhub-pilot/examples) for verified runs.

### 🎴 [`omikuji-hub`](./.claude/skills/omikuji-hub/SKILL.md)
> An onchain shrine where the priest is a KeeperHub agentic wallet. Every pull pays — even the bad fortunes.

Pulls a Japanese-style fortune (Daikichi → Daikyō) deterministically from `keccak256(blockHash + askerAddress + utcDate)` and **always** drops a real USDC reward whose amount escalates with rarity (0.005 → 0.00005). Demonstrates the full "AI decides → KeeperHub executes" pattern in a self-contained, judge-friendly skill. Verified runs in [`examples/01-pull-fortune.md`](./.claude/skills/omikuji-hub/examples/01-pull-fortune.md).

To use either skill yourself:
```bash
claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp
# complete browser OAuth, then ask Claude to invoke the skill
```

## Docs

- Hackathon: [overview](docs/hackathon/overview.md) · [prize details](docs/hackathon/prizes.md) · [schedule](docs/hackathon/schedule.md)
- Research: [AI agent trends](docs/research/ai-agent-trends.md) · [frameworks](docs/research/frameworks.md) · [on-chain agents](docs/research/onchain-agents.md)
