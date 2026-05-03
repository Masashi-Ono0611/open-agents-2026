# open-agents-2026

Built for [ETHGlobal Open Agents](https://ethglobal.com/events/openagents) (April 24 – May 6, 2026) — **KeeperHub track**.

## 🎴 Omikuji Hub

> An onchain shrine where the priest is a KeeperHub agentic wallet.
> Every pull pays — even the bad fortunes.

A single Claude Code Skill that turns one English prompt into

1. a deterministic-randomness Japanese fortune draw (大吉 → 大凶), and
2. a real on-chain USDC reward whose amount tiers with the fortune's rarity,

both running end-to-end against the live KeeperHub agentic wallet on Base Sepolia. No frontend, no backend — the agent itself is the product.

→ Skill spec: [`.claude/skills/omikuji-hub/SKILL.md`](./.claude/skills/omikuji-hub/SKILL.md)
→ Verified live runs: [`.claude/skills/omikuji-hub/examples/01-pull-fortune.md`](./.claude/skills/omikuji-hub/examples/01-pull-fortune.md)
→ Submission writeup: [`SUBMISSION.md`](./SUBMISSION.md)
→ Builder feedback (bounty): [`FEEDBACK.md`](./FEEDBACK.md)

## How it works

```
user: "Pull today's omikuji for 0xC94d…6169"

  Phase 1 — divine the fortune (free, deterministic)
  ┌──────────────────────────────────────────────────┐
  │ blockHash + askerAddress + utcDate               │
  │   → keccak256(...) → first byte ∈ [0,255]        │
  │   → tier = Daikichi | Kichi | Suekichi | Kyō     │
  │           | Daikyō                               │
  └──────────────────────────────────────────────────┘
                          │
  Phase 2 — settle the reward on-chain (always)
  ┌──────────────────────────────────────────────────┐
  │ mcp__keeperhub__execute_transfer({               │
  │   network: "84532",          // Base Sepolia     │
  │   recipient_address: <asker>,                    │
  │   amount: <tier reward>,                         │
  │   token_address: USDC,                           │
  │ })                                               │
  │ → KeeperHub agentic wallet 0x8F31…81FD signs     │
  │ → real Base Sepolia tx ~9s later                 │
  │ → BaseScan link returned to the user             │
  └──────────────────────────────────────────────────┘
```

| Tier | Probability | Reward |
|---|---|---|
| 大吉 Daikichi (great blessing) | ≈10% | **0.005 USDC** (jackpot) |
| 吉 Kichi (blessing) | ≈30% | **0.001 USDC** |
| 末吉 Suekichi (small blessing) | ≈40% | **0.0003 USDC** |
| 凶 Kyō (curse, but not the worst) | ≈15% | **0.0001 USDC** (consolation) |
| 大凶 Daikyō (great curse) | ≈5% | **0.00005 USDC** ("even bad luck pays") |

## On-chain evidence (Base Sepolia)

| Asker (last 4) | Tier | Amount | Transaction |
|---|---|---|---|
| `…dCB8` | Daikichi 大吉 | 0.005 USDC | [`0xf31a…019d`](https://sepolia.basescan.org/tx/0xf31a2380f7b35202231ba1e94e97d97f7d93c203b56d05eac8a6d9cd647d019d) |
| `…6169` | Suekichi 末吉 | 0.0003 USDC | [`0x8f77…74d4`](https://sepolia.basescan.org/tx/0x8f77902da8c210aa99fc79fdc6a531c7aee21cfbe44f42a624ed4798b5d174d4) |
| `…6169` | Daikyō 大凶 | 0.00005 USDC | [`0xddad…6261`](https://sepolia.basescan.org/tx/0xddad5478033d08ffeccb53cfcd42644d6ce5155e37bacda3751f29ea63b56261) |

KeeperHub agentic wallet: [`0x8F31fF5eaae3A1036839c503248e9f42479C81FD`](https://sepolia.basescan.org/address/0x8F31fF5eaae3A1036839c503248e9f42479C81FD)
USDC (Circle): [`0x036CbD53842c5426634e7929541eC2318f3dCF7e`](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e)

## Run it yourself

The skill ships ready-to-use. You need Claude Code with the KeeperHub MCP server attached.

```bash
# 1. attach KeeperHub
claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp
# (browser OAuth opens; sign in to your KeeperHub org)

# 2. inside this repo, ask Claude
#    "Pull today's omikuji for 0xYourWallet"
#
# Claude routes to .claude/skills/omikuji-hub/SKILL.md and runs the
# two-phase flow — Phase 1 is a free RPC + keccak, Phase 2 sends a
# real Base Sepolia USDC transfer via the agentic wallet.
```

Phase 1 alone (the fortune draw) needs no KeeperHub key — see [`examples/01-pull-fortune.md`](./.claude/skills/omikuji-hub/examples/01-pull-fortune.md) for a 20-line `bun -e` reproducer.

## Why this is creative — the pitch

1. **Conditional execute, scaled to *every* path.** Most demo skills only call onchain on the happy path. This one calls onchain on **every** path; the *amount* is the discriminator instead of a boolean. Judges always see a real tx.
2. **Strip the omikuji theme and you have generic infra.** "AI agent decides which tier a human qualifies for, then pays the corresponding amount via KeeperHub" is the shape behind quiz prizes, retention drops, onboarding bonuses, and tiered referral payouts. The skill is a working primitive disguised as a folk-game.
3. **Two-tool composition with a real KeeperHub MCP server.** Not a pre-recorded mock. Each pull genuinely calls `mcp__keeperhub__execute_transfer` and `mcp__keeperhub__get_direct_execution_status`. The transactions in this README are independently verifiable on-chain.
4. **Cultural framing as a discovery angle.** "おみくじ" makes the skill discoverable to a Japanese-speaking user; the JSON output and BaseScan tx are universal.

## Sister skill

[`keeperhub-pilot`](./.claude/skills/keeperhub-pilot/SKILL.md) — generic "one English prompt → one KeeperHub workflow → one tx" wrapper, used as the foundation that `omikuji-hub` calls into. Captures the gotchas (`network` must be a chain-id string, `tokenConfig` must be a JSON string, template syntax `{{@id:Label.data.field}}`) so future skills don't re-discover them.

## Repo layout

```
.claude/skills/omikuji-hub/      ← the submission
.claude/skills/keeperhub-pilot/  ← sister skill (generic wrapper)
SUBMISSION.md                    ← ETHGlobal submission writeup
FEEDBACK.md                      ← Builder Feedback Bounty
app/keepersake/                  ← earlier KeeperSake explorations; the
                                   integration learnings from this codebase
                                   are what FEEDBACK.md distills
docs/hackathon/                  ← prize details, schedule, overview
```

## Prize targets

- **KeeperHub Track 1 — Best Use of KeeperHub** ($4,500)
- **KeeperHub Builder Feedback Bounty** ($250) — see [`FEEDBACK.md`](./FEEDBACK.md)
