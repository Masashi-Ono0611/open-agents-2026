# 🎴 Omikuji Hub — ETHGlobal Open Agents Submission

**Track:** KeeperHub — Track 1 (Best Use of KeeperHub) + Builder Feedback Bounty
**Builder:** Masa — solo
**Hackathon:** [ETHGlobal Open Agents](https://ethglobal.com/events/openagents) (April 24 – May 6, 2026)
**Submission date:** 2026-05-03

---

## One-liner

> An onchain shrine where the priest is a KeeperHub agentic wallet. Every fortune pull settles on Base Sepolia in ~9 seconds, and **every tier pays — even the bad fortunes**.

## Description (for ETHGlobal form)

Omikuji Hub is a Claude Code Skill that turns a single English prompt — *"pull today's omikuji for 0xC94d…6169"* — into a real Base Sepolia transaction. Phase 1 derives a Japanese-style fortune (大吉 / 吉 / 末吉 / 凶 / 大凶) deterministically from `keccak256(latestBlockHash + askerAddress + utcDate)`. Phase 2 unconditionally settles a USDC reward whose magnitude tiers with the fortune's rarity, by calling `mcp__keeperhub__execute_transfer` against the KeeperHub agentic wallet `0x8F31fF5eaae3A1036839c503248e9f42479C81FD`. There is no frontend, no backend, and no user-side keys — the agent runtime is the entire product, and KeeperHub is the entire execution layer.

Strip the omikuji theme and the same primitive ships quiz prizes, retention drops, onboarding bonuses, and tiered referral payouts. The folk-game framing is a Trojan horse for production agentic-payout infrastructure.

## What it does

1. User asks Claude (in any session with the KeeperHub MCP server attached) to pull today's omikuji for a wallet address.
2. The Skill ([`.claude/skills/omikuji-hub/SKILL.md`](./.claude/skills/omikuji-hub/SKILL.md)) routes automatically. It fetches the latest Base Sepolia block via JSON-RPC, computes `keccak256(blockHash + asker + utcDate)`, takes the first byte, and maps it into one of five tiers.
3. Regardless of tier, the Skill calls `mcp__keeperhub__execute_transfer` with the corresponding USDC amount, polls `mcp__keeperhub__get_direct_execution_status` until completion, and emits a CLI-style report ending with a JSON block and a BaseScan link.

| Tier | Probability | Reward |
|---|---|---|
| 大吉 Daikichi | ≈10% | **0.005 USDC** (jackpot) |
| 吉 Kichi | ≈30% | 0.001 USDC |
| 末吉 Suekichi | ≈40% | 0.0003 USDC |
| 凶 Kyō | ≈15% | 0.0001 USDC (consolation) |
| 大凶 Daikyō | ≈5% | 0.00005 USDC ("even bad luck pays") |

## How it's made

- **Runtime:** Claude Code (Opus 4.7) with the KeeperHub remote MCP server attached via OAuth (`claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp`). All state lives in two files: `SKILL.md` for the procedure, `examples/01-pull-fortune.md` for verified evidence.
- **Randomness:** A pure read against `https://sepolia.base.org` for the latest block, then `keccak256(blockHash + asker + utcDate)` via `viem`. No oracle, no VRF — the determinism is the point: it makes the fortune verifiable from any wallet without trusting the agent.
- **Execution:** Two MCP tool calls — `execute_transfer` and `get_direct_execution_status`. The agentic wallet (`0x8F31fF5eaae3A1036839c503248e9f42479C81FD`) is a managed KeeperHub web3 integration created at the start of the hackathon and pre-funded with Base Sepolia ETH (gas) and Circle USDC (rewards).
- **Token:** Circle's official Base Sepolia USDC (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`, 6 decimals). Not a mock.
- **No on-chain custom contract.** The submission deliberately uses the *vanilla* USDC `transfer` and lets KeeperHub be the entire trust surface. (An earlier exploration in this repo, `app/keepersake/`, did deploy a custom vault contract for a different concept; that work informed the Builder Feedback writeup but is not the submission.)

## Why this is a good KeeperHub submission

1. **Conditional execute, scaled to *every* path.** Most demos call onchain only on the happy path. Omikuji Hub calls onchain on **every** path; the *amount* is the discriminator instead of a boolean. Every judge who pulls the Skill sees a real BaseScan tx — no failed-precondition demo deaths.
2. **Strip the theme and you have generic infra.** "AI agent decides which tier a human qualifies for, then pays the corresponding amount via KeeperHub" is the shape behind a dozen real product features. The Skill is a working primitive disguised as a folk-game.
3. **Two-tool composition with a real KeeperHub MCP server.** Not a pre-recorded mock. Each pull genuinely calls `execute_transfer` and `get_direct_execution_status` against the live `app.keeperhub.com/mcp` endpoint. The transactions in this submission are independently verifiable on-chain.
4. **Cultural framing as a discovery angle.** "おみくじ" makes the Skill discoverable to a Japanese-speaking developer; the JSON output and BaseScan tx are universal.
5. **Zero frontend, zero backend, zero deploy.** The agent runtime is the entire product. The same Skill ships unchanged into Discord bots, Telegram bots, onboarding flows, or campaign sites — they just become different launchers for the same agent.

## On-chain evidence (Base Sepolia)

All transactions below are signed and submitted by the KeeperHub agentic wallet `0x8F31fF5eaae3A1036839c503248e9f42479C81FD`, calling `transfer` on Circle USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e`.

| When | Asker | Tier | Amount | Transaction |
|---|---|---|---|---|
| 2026-05-03 | `0x08D8…dCB8` | Daikichi 大吉 | 0.005 USDC | [`0xf31a…019d`](https://sepolia.basescan.org/tx/0xf31a2380f7b35202231ba1e94e97d97f7d93c203b56d05eac8a6d9cd647d019d) |
| 2026-05-03 | `0xC94d…6169` | Kyō 凶 | 0.0001 USDC | [`0x295a…1549`](https://sepolia.basescan.org/tx/0x295a99926c50454d41ec38a6584cd861eba8a980ba01c592af8cc9960a191549) |
| 2026-05-03 | `0xC94d…6169` | Daikichi 大吉 | 0.005 USDC | [`0x4783…103b`](https://sepolia.basescan.org/tx/0x4783858d65dedbdba46a554c68bc56fc88c399d6dfe063d09215db9bbd86103b) |
| 2026-05-03 | `0xC94d…6169` | Suekichi 末吉 | 0.0003 USDC | [`0x8f77…74d4`](https://sepolia.basescan.org/tx/0x8f77902da8c210aa99fc79fdc6a531c7aee21cfbe44f42a624ed4798b5d174d4) |
| 2026-05-03 | `0xC94d…6169` | Daikyō 大凶 | 0.00005 USDC | [`0xddad…6261`](https://sepolia.basescan.org/tx/0xddad5478033d08ffeccb53cfcd42644d6ce5155e37bacda3751f29ea63b56261) |

Each row is a different fortune tier producing a real, decoded `Transfer(USDC)` event of the matching amount.

## Demo script (≤2 minutes)

1. Open Claude Code in this repo.
2. (One-time) `claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp`, complete browser OAuth.
3. Type: **"Pull today's omikuji for 0x08D811A358850892029251CcC8a565a32fd2dCB8"**.
4. Watch the Skill print Phase 1 (block fetch, keccak, tier), then Phase 2 (`execute_transfer` accepted, status polled, BaseScan link emitted).
5. Click the BaseScan link and confirm the on-chain `Transfer(USDC)` event.

## Repo layout

```
.claude/skills/omikuji-hub/
├── SKILL.md                       # the procedure (single source of truth)
└── examples/01-pull-fortune.md    # verified live runs from 2026-05-03

.claude/skills/keeperhub-pilot/
└── SKILL.md                       # sister skill: generic KeeperHub wrapper

SUBMISSION.md                      # this file
FEEDBACK.md                        # Builder Feedback Bounty submission
README.md                          # repo overview

app/keepersake/                    # earlier exploration; the integration
                                   # learnings live in FEEDBACK.md
docs/hackathon/                    # event materials
```

## Tracks targeted

| Track | Prize | How this submission qualifies |
|---|---|---|
| **KeeperHub Track 1 — Best Use of KeeperHub** | $4,500 | Both focus areas covered. *Innovative use:* every-path conditional execute over deterministic randomness — a payout primitive disguised as a folk-game. *Integration:* the entire product is two MCP tools (`execute_transfer` + `get_direct_execution_status`), demonstrating that KeeperHub alone is enough to ship an agent-driven onchain action — no separate backend, indexer, or scheduler. |
| **KeeperHub Builder Feedback Bounty** | $250 | See [`FEEDBACK.md`](./FEEDBACK.md). Eight reproducible friction points (F1–F8), four feature requests ranked by leverage, scored across seven dimensions. |

## Team & contact

- **Builder:** Masa (solo)
- **GitHub:** github.com/masashiono0611
- **Telegram / X:** on file with ETHGlobal

## Acknowledgements

KeeperHub team for the OAuth-based remote MCP — the friction-free auth was the unlock that made a same-day "prompt → tx" Skill viable. Circle for the Base Sepolia USDC faucet. ETHGlobal for hosting Open Agents.
