# open-agents-2026

App built for [ETHGlobal Open Agents hackathon](https://ethglobal.com/events/openagents) (April 24 – May 6, 2026).

## KeeperSake 🍶

> An on-chain keepsake, kept by a Keeper.

Your USDC, your final words, your heir. Commit them once, then tap "I'm alive" as long as you are. The day you stop, a KeeperHub workflow runs `execute()` on your behalf and your heir inherits — automatically, on-chain, no lawyer.

Lives in [`app/keepersake/`](./app/keepersake/). See its
[README](./app/keepersake/README.md) for setup, the
[KeeperHub workflow doc](./app/keepersake/docs/keeperhub-workflow.md) for the
natural-language prompt that generates the watcher, and
[`FEEDBACK.md`](./app/keepersake/FEEDBACK.md) for the Builder Feedback Bounty submission.

Built for the **KeeperHub** track at ETHGlobal Open Agents.

## Getting Started

```bash
cd app/keepersake/contracts
bun install && bun run test && bun run deploy:baseSepolia

cd ../frontend
bun install && cp .env.example .env.local && bun run dev
```

## Docs

- [ETHGlobal Open Agents — Event Overview](docs/ethglobal-openagents-overview.md)
- [ETHGlobal Open Agents — Prize Details](docs/ethglobal-openagents-prizes.md)
