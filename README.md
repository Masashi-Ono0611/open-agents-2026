# open-agents-2026

App built for [ETHGlobal Open Agents hackathon](https://ethglobal.com/events/openagents) (April 24 – May 6, 2026).

## Sayonara Switch ⚰️

> The dead man's switch for the post-AI economy.

Commit your cbBTC to an heir. Tap "I'm alive" to reset the timer. If you go silent past
your timeout, a KeeperHub workflow runs `execute()` for you and your heir inherits —
automatically, on-chain, no lawyer.

Lives in [`app/sayonara-switch/`](./app/sayonara-switch/). See its
[README](./app/sayonara-switch/README.md) for setup, the
[KeeperHub workflow doc](./app/sayonara-switch/docs/keeperhub-workflow.md) for the
natural-language prompt to generate the watcher, and
[`FEEDBACK.md`](./app/sayonara-switch/FEEDBACK.md) for the Builder Feedback Bounty submission.

Built for the **KeeperHub** track at ETHGlobal Open Agents.

## Getting Started

```bash
cd app/sayonara-switch/contracts
bun install && bun run test && bun run deploy:baseSepolia

cd ../frontend
bun install && cp .env.example .env.local && bun run dev
```

## Docs

- [ETHGlobal Open Agents — Event Overview](docs/ethglobal-openagents-overview.md)
- [ETHGlobal Open Agents — Prize Details](docs/ethglobal-openagents-prizes.md)
