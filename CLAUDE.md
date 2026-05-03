# open-agents-2026

ETHGlobal Open Agents hackathon project (April 24 – May 6, 2026).

## Context

- Hackathon: https://ethglobal.com/events/openagents
- Prize details: docs/ethglobal-openagents-prizes.md
- Event overview: docs/ethglobal-openagents-overview.md

## Concept: Sayonara Switch ⚰️

> The dead man's switch for the post-AI economy.

User commits cbBTC to an heir + writes final words + sets a timeout. They must `heartbeat()`
periodically. If silence exceeds the timeout, a KeeperHub workflow calls `execute(user)` and
the cbBTC moves to the heir. Permissionless contract; KeeperHub is the polite default.

Lives in `app/sayonara-switch/`.

Prize target: **KeeperHub Track 1 — Best Use of KeeperHub** ($4,500) + Builder Feedback
Bounty ($250).

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind + RainbowKit + wagmi/viem (Bun)
- **Contract**: Solidity 0.8.20, Hardhat, OpenZeppelin ERC20 helpers
- **Chain**: Base Sepolia (chainId 84532); cbBTC via `MockCbBTC` faucet
- **Automation**: KeeperHub MCP (`https://app.keeperhub.com/mcp`), workflow generated via `ai_generate_workflow`
- **Storage**: will note as keccak hash on-chain; full text via `localStorage` in demo (IPFS in prod)

## Commands

```bash
# Contracts
cd app/sayonara-switch/contracts
bun install
bun run test                  # 8 tests
bun run deploy:baseSepolia    # paste output addrs into frontend/lib/contracts.ts

# Frontend
cd app/sayonara-switch/frontend
bun install
bun run dev                   # http://localhost:3000
```

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
