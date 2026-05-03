# open-agents-2026

ETHGlobal Open Agents hackathon project (April 24 – May 6, 2026).

## Context

- Hackathon: https://ethglobal.com/events/openagents
- Prize details: docs/hackathon/prizes.md
- Event overview: docs/hackathon/overview.md

## Submission: 🎴 Omikuji Hub

> An onchain shrine where the priest is a KeeperHub agentic wallet. Every pull pays — even the bad fortunes.

A single Claude Code Skill that turns one English prompt into (1) a deterministic Japanese fortune draw and (2) a real on-chain USDC reward whose amount tiers with the fortune's rarity. Both phases run end-to-end against the live KeeperHub agentic wallet on Base Sepolia. No frontend, no backend — the agent runtime is the entire product.

- Skill spec: `.claude/skills/omikuji-hub/SKILL.md`
- Verified live runs: `.claude/skills/omikuji-hub/examples/01-pull-fortune.md`
- Submission writeup: `SUBMISSION.md`
- Builder feedback (bounty): `FEEDBACK.md`

Prize target: **KeeperHub Track 1 — Best Use of KeeperHub** ($4,500) + **Builder Feedback Bounty** ($250).

## How it works (one screen)

1. User prompt → Skill routes via Claude Code's auto-skill loader.
2. **Phase 1** — fetch latest Base Sepolia block, compute `keccak256(blockHash + askerAddress + utcDate)`, take first byte, map into 5 tiers (大吉 / 吉 / 末吉 / 凶 / 大凶).
3. **Phase 2** — call `mcp__keeperhub__execute_transfer` for the tier's USDC amount, poll `mcp__keeperhub__get_direct_execution_status`, return BaseScan link.

Stack:
- **Runtime:** Claude Code (Opus 4.7) + KeeperHub remote MCP via OAuth
- **Chain:** Base Sepolia (chainId 84532). Token = Circle official USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (6 decimals)
- **Agentic wallet:** `0x8F31fF5eaae3A1036839c503248e9f42479C81FD` (managed KeeperHub web3 integration)
- **Determinism:** `viem`'s `keccak256` against the latest Base Sepolia block hash
- **No custom contract.** Vanilla USDC `transfer`; KeeperHub is the entire trust surface.

## Earlier exploration (not the submission)

`app/keepersake/` is an earlier exploration of a "watch a contract and call `execute()` on a schedule" workflow with a custom Solidity vault. The integration learnings from that work are distilled into `FEEDBACK.md` (items F1–F8 are workflow-side feedback from there; F9–F10 are Omikuji-Hub-specific). The shipped submission deliberately narrowed scope to two MCP tools so the agent runtime alone could be the entire product.

## Commands

```bash
# Attach KeeperHub MCP (one-time)
claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp

# Then ask Claude in this repo:
#   "Pull today's omikuji for 0xYourWallet"
# Routes to .claude/skills/omikuji-hub/SKILL.md.
```

The earlier `app/keepersake/` Hardhat + Next.js stack still builds (`bun install && bun run test` in `contracts/`, `bun run dev` in `frontend/`) but is not part of the submission flow.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.

Key routing rules:
- "Pull omikuji", "draw my fortune", "おみくじ" → invoke omikuji-hub
- "Send X USDC to Y", "transfer", "schedule a transfer" → invoke keeperhub-pilot
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Save progress, checkpoint, resume → invoke checkpoint
