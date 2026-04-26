# TonAgent — Censorship-Resistant AI Agent Runtime

**Status:** APPROVED  
**Date:** 2026-04-26  
**Hackathon:** ETHGlobal Open Agents (deadline: May 3, 2026)

---

## Pitch

> "ENS × TON Storage × AXL — the first AI agent whose brain can't be censored."

AI frontends have been killed repeatedly — Tornado Cash, Uniswap's token restrictions. The smart contracts survive; the UIs die because they live on centralized infrastructure.

AI agents have the exact same structural vulnerability: their memory lives on AWS, their communication routes through central servers, their identity depends on a single provider. TonAgent fixes this.

---

## Problem

Every AI agent today can be stopped by:
1. Deleting the memory store (hosted on AWS/GCP)
2. Blocking the communication channel (centralized API/WebSocket)
3. Revoking the identity (API key, centralized auth)

The smart contracts and protocols underneath are censorship-resistant. The agent layer on top is not.

---

## Solution

Three components, each replacing one centralized dependency:

| Dependency | Centralized (today) | TonAgent |
|---|---|---|
| Identity | API key / OAuth | ENS name (tonagent.eth) |
| Memory | AWS S3 / database | TON Storage (content-addressed, immutable) |
| Communication | REST API / WebSocket | AXL (Gensyn P2P, no central broker) |
| Execution | Hosted lambda | KeeperHub (onchain execution layer) |

---

## Architecture

```
Agent A (tonagent.eth)
  │
  ├── identity.ts ──► ENS text record: ton_memory_bag = "bagid:<hex>"
  │                                                          │
  ├── storage.ts ──► TON Storage ◄────────────────────────┘
  │                  [agent memory JSON, immutable bag]
  │
  └── comm.ts ──► AXL node-a (local process)
                       │  P2P mesh, no central server
                  AXL node-b (local process)
                       │
               Agent B resolves tonagent.eth
                       │
               reads ton_memory_bag from ENS
                       │
               fetches memory from TON Storage bag ID
                       │
               executor.ts ──► KeeperHub ──► Base Sepolia
                                             [AgentEvent.emitEvent()]
```

### Data Flow (end-to-end)

1. Agent A computes a memory snapshot (`AgentMemory` JSON)
2. `storage.ts` uploads snapshot to TON Storage via `sovereign-deploy-kit`, receives `bagId`
3. `identity.ts` writes `bagId` to ENS text record `ton_memory_bag` on Sepolia testnet
4. Agent B receives a message from Agent A over AXL
5. Agent B calls `identity.ts.resolveMemoryBag("tonagent.eth")` → gets `bagId`
6. Agent B calls `storage.ts.loadMemory(bagId)` → gets Agent A's memory
7. Agent A's `executor.ts` registers a job with KeeperHub → triggers `AgentEvent.emitEvent()` on Base Sepolia

---

## Data Contracts

### Agent Memory Schema

```typescript
interface AgentMemory {
  agentId: string;       // ENS name, e.g. "tonagent.eth"
  version: number;       // incremented on each save
  snapshot_ts: number;   // Unix timestamp
  memory: Record<string, unknown>;  // arbitrary key-value state
  config: {
    model: string;       // e.g. "claude-sonnet-4-6"
    [key: string]: unknown;
  };
}
```

### ENS Text Record

- **Key:** `ton_memory_bag`
- **Value format:** `bagid:<hex_bag_id>`
- **Example:** `bagid:a3f9c82e1b4d7f2c...`
- **Network:** Ethereum Sepolia testnet (for hackathon demo)

### AXL Message Envelope

```typescript
interface AXLMessage {
  from: string;    // sender's ENS name
  to: string;      // recipient's ENS name or broadcast
  type: "discovery" | "memory_request" | "memory_response" | "task";
  payload: Record<string, unknown>;
  sig: string;     // "demo-unsigned" for MVP; secp256k1 in production
}
```

### TON Storage Note

TON Storage bags are **content-addressed and immutable**. Each memory update creates a new bag. The ENS text record always points to the latest bag. ENS text record writes are infrequent (agent startup only), so the ~15s Sepolia finality is acceptable.

---

## File Structure

```
ton-agent-sdk/
├── src/
│   ├── storage.ts       # sovereign-deploy-kit wrapper: saveMemory / loadMemory
│   ├── identity.ts      # ENS: register name, update/resolve ton_memory_bag
│   ├── comm.ts          # AXL: sendMessage, onMessage
│   └── executor.ts      # KeeperHub: register job, check status
├── package.json
└── tsconfig.json

axl-node/
├── node-a.ts            # AXL node process A
├── node-b.ts            # AXL node process B
└── setup.sh             # reproducible startup script

contracts/
└── AgentEvent.sol       # minimal event-emit contract for KeeperHub demo

demo/
└── run.ts               # end-to-end demo script

FEEDBACK.md              # required by Gensyn and KeeperHub prize tracks
```

---

## Prize Targets

| Track | Sponsor | Prize | Requirement |
|---|---|---|---|
| Best ENS Integration | ENS | $5,000 | ENS doing real work: storing/resolving agent memory bag ID |
| Best Use of AXL | Gensyn | $5,000 | P2P communication across **separate AXL nodes** (2 local processes qualify) |
| Best Use of KeeperHub | KeeperHub | $4,500 | Novel use of execution layer |
| Builder Feedback Bounty | KeeperHub | $500 | Actionable FEEDBACK.md on DX/bugs |
| **Total** | | **~$15,000** | |

**Max 3 tracks:** ENS + Gensyn + KeeperHub

---

## Minimum Viable Demo

If any dependency fails, fallback to this reduced scope that still wins prizes:

| Component | Ideal | Fallback | Prize Impact |
|---|---|---|---|
| AXL P2P | 2 local processes | HTTP localhost mock | Gensyn DQ; ENS + KeeperHub remain |
| ENS identity | Sepolia text record write | hardcoded bag ID | No impact (demo read path still works) |
| TON Storage | real-time bag creation | pre-uploaded bag | No impact |
| KeeperHub | API job registration | direct Base Sepolia tx | KeeperHub DQ; $500 feedback bounty remains |

**Absolute minimum demo:** ENS name → TON bag ID → agent memory read. This alone demonstrates the core value proposition.

---

## Risk Table

| Risk | Probability | Fallback |
|---|---|---|
| AXL startup fails / poor docs | Medium | HTTP P2P mock; focus on ENS + KeeperHub |
| TON Storage propagation delay | Low | Pre-upload bag before recording demo video |
| ENS Sepolia text record issues | Low | Demo ENS name resolution only |
| KeeperHub API auth issues | Medium | Direct Base Sepolia tx; still write FEEDBACK.md for $500 |

---

## Key Dependencies

| Dependency | What it is | Link |
|---|---|---|
| sovereign-deploy-kit | TON Storage CLI (already implemented) | `../ton-projects/sovereign-deploy-kit/` |
| AXL | Gensyn P2P agent comms layer (Yggdrasil overlay) | https://docs.gensyn.network |
| ENS SDK | ENS name registration and text record management | https://docs.ens.domains |
| viem | EVM interaction library | https://viem.sh |
| KeeperHub | Onchain execution layer (Base Sepolia) | https://keeperhub.com |

---

## Open Questions (all resolved)

- **AXL 2-node requirement:** 2 local processes on the same machine confirmed to qualify for the Gensyn prize.
- **ENS name:** Pre-register `tonagent.eth` on Sepolia testnet on Day 0 to eliminate Day 2 uncertainty.
- **ENS gas:** Sepolia testnet. Private key in env var. Faucet for gas.
- **KeeperHub network:** Base Sepolia confirmed. API key auth.
- **AXL signing:** `"sig": "demo-unsigned"` for MVP. Production would use secp256k1.
- **KeeperHub action:** `AgentEvent.emitEvent()` — a minimal Solidity contract that emits an event, deployed to Base Sepolia.
