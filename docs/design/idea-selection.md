# Idea Selection — How We Got to TonAgent

**Date:** 2026-04-26  
**Context:** ETHGlobal Open Agents hackathon (April 24 – May 6, 2026), $50,000+ prize pool

This document records the thinking process behind choosing TonAgent as the project for this hackathon.

---

## Developer Background

The deciding factor in hackathon idea selection is always: what can *you* build that others cannot?

| Skill | Level | Asset available |
|---|---|---|
| TON blockchain (FunC/Tact) | Most proficient | `sovereign-deploy-kit`, `bagel-finance-core`, `ton-atlas` ideation |
| Telegram Mini Apps (TMA) | Expert | `bagel-finance-TMA` skeleton |
| MEV / sponsored transactions | Deep research | `mev-research/`, `searcher-sponsored-tx/` |
| Solidity / EVM | Experienced | — |
| P2P / mesh networking | Conceptual + shipped | `bitchat` (Bluetooth mesh messaging app) |

**Key insight:** The combination of TON expertise + MEV knowledge + P2P architecture is extremely rare in ETH hackathon participants. Most competitors know EVM only.

---

## Landscape Research

Before generating ideas, we surveyed what already exists:

**Already done (eliminate these):**
- `hAUTH`: Telegram bot for managing EVM AI agents with predefined conditions → "Telegram + EVM agent management" is taken
- `0xGasless`: ERC-4337-based gasless agent SDK → basic "gasless" is not a differentiator

**Genuinely open:**
- ERC-7857 (iNFT, 0G): AI agents as ownable/tradeable NFTs — almost no hackathon submissions yet
- AXL (Gensyn): launched April 22, 2026 — 4 days old as of the hackathon
- ENS for agent identity: ENSIP-25 and ENSIP-26 are new, creative ENS use cases are wide open

**Key landscape finding:**
> Every AI agent project in this space treats memory and communication as solved problems. Nobody is questioning the centralization of agent infrastructure itself.

---

## Idea Space Explored

We systematically explored 4 directions before converging:

### Direction 1: MEV-Aware Agent Execution
**Concept:** An AI agent that checks sandwich risk before executing Uniswap swaps and routes through Flashbots MEV-Share when needed. Mints execution as ERC-7857 iNFT.

**Pros:** Technically novel (no agent does this today), leverages MEV research directly  
**Cons:** Claude subagent endorsed this direction. But the developer pushed back — it doesn't advance any long-term personal project. One-shot demo.

**Verdict:** Shelved. Good idea, wrong motivation.

### Direction 2: Telegram Mini App (TMA) AI Agent
**Concept:** A TMA where users instruct an AI agent via natural language to execute EVM operations.

**Pros:** TMA expertise is rare in ETH hackathons  
**Cons:** Developer correctly noted: "TMA is easy enough that it's not really a moat." Also, `hAUTH` partially occupies this space.

**Verdict:** Rejected by the developer. Correct call.

### Direction 3: GiftFi × ERC-7857
**Concept:** Mint Telegram Gifts (TON NFTs) as ERC-7857 iNFTs on 0G Chain. AI agent manages lending/liquidation.

**Pros:** Truly novel, would target 0G ($15k) + Uniswap ($5k)  
**Cons:** Requires TON→EVM bridge for Telegram Gifts (unsolved problem). 7 days solo, unrealistic.

**Verdict:** Future project. Too ambitious for this hackathon.

### Direction 4: Freedom Stack for AI Agents ← CHOSEN
**Concept:** Apply the Freedom Stack vision (censorship-resistant infrastructure) to AI agents. Use `sovereign-deploy-kit` (already built) to store agent memory on TON Storage, ENS for identity, AXL for P2P communication.

**Why this won:**
1. `sovereign-deploy-kit` is already implemented → significant time savings
2. Advances a long-term personal thesis (Freedom Stack) rather than being a one-shot demo
3. The intersection of ENS (EVM) + TON Storage + AXL is genuinely novel
4. AXL uses Yggdrasil — same architectural family as TON's ADNL — so the learning curve is short
5. Satisfies the developer's desire to make the hackathon "mean something" beyond the prize

---

## The Core Insight

The conventional wisdom in AI agent tooling is: **"We should make agents more capable."** Everyone is adding tools, memory frameworks, planning loops.

The assumption nobody is questioning: **"We trust the infrastructure those agents run on."**

TonAgent's thesis: the infrastructure is the problem. When the infrastructure is centralized, the agent is centralized — regardless of how capable it is. `sovereign-deploy-kit` already proved this for frontends (Tornado Cash, Uniswap examples). The same proof applies to agent memory and communication.

---

## Eureka Moment

> Everyone builds AI agents that talk to EVM. Nobody builds agents that use TON Storage or P2P overlay networks. The developer has deep expertise in both. The hackathon's AXL (Yggdrasil-based) and the developer's prior knowledge (ADNL-based TON Proxy) are the same architectural pattern.

The jump that nobody in the hackathon will make: **ENS text record → TON bag ID → censorship-resistant agent memory.** This bridges the EVM identity world with the TON decentralized storage world in a single line of resolution logic.

---

## What We Rejected (and Why)

| Idea | Rejection Reason |
|---|---|
| Full cross-chain TON+EVM agent | 7 days solo is too risky; TON infra setup time is unpredictable |
| 0G OpenClaw framework extension | 0G framework learning curve would dominate the week |
| Basic TMA + EVM agent | `hAUTH` already exists in this space |
| Pure MEV-guard SDK | Doesn't advance long-term personal project |

---

## Prize Strategy

**Chosen tracks (max 3):**

1. **ENS** — "Most Creative Use of ENS": using ENS text record as a pointer to TON Storage is genuinely novel and well within the "creative use" track definition.
2. **Gensyn (AXL)** — P2P agent communication without centralized coordination. Two local AXL processes satisfy the cross-node requirement per Gensyn's docs.
3. **KeeperHub** — Execution layer integration + $500 feedback bounty regardless of placement.

**0G ($15k) was considered and skipped** because it would require learning the OpenClaw framework from scratch, and the learning cost would dominate 7 days.
