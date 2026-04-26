# TonAgent — Build Plan

**Deadline:** May 3, 2026, 12:00 PM EDT  
**Available time:** ~7 days (April 26 – May 3)  
**Team:** Solo

---

## Day 0 (April 26, today) — Validate All Dependencies

Do not write a single line of product code until each dependency is confirmed working. Unknown dependency behavior is the primary risk for this build.

### AXL (Gensyn)
- [ ] Read AXL docs: https://docs.gensyn.network
- [ ] Install AXL and start 1 local node
- [ ] Confirm startup log appears (no errors)
- [ ] Identify: does 2-node local setup require separate ports? Separate configs?
- [ ] **Go/No-Go:** If AXL won't start in 2 hours, activate fallback (HTTP P2P mock) and drop Gensyn track

### ENS (Ethereum Sepolia)
- [ ] Register `tonagent.eth` on Sepolia testnet (or confirm an existing .eth name works)
- [ ] Write a text record (`ton_memory_bag` = `bagid:test`) via viem + ENS SDK
- [ ] Read the text record back
- [ ] Confirm gas source (Sepolia faucet, private key in `.env`)
- [ ] **Go/No-Go:** If ENS text record write fails, demo ENS name resolution only (still qualifies for creative use track)

### TON Storage
- [ ] Run `sovereign-deploy-kit` and upload a small JSON file
- [ ] Note the returned bag ID
- [ ] Confirm bag is retrievable via bag ID
- [ ] Note: bag propagation may take minutes. Pre-upload demo content the night before.

### KeeperHub
- [ ] Get API key: https://keeperhub.com
- [ ] Make a test API call (create a job on Base Sepolia testnet)
- [ ] Write minimal `AgentEvent.sol`, deploy to Base Sepolia
- [ ] Register one KeeperHub job that calls `AgentEvent.emitEvent()`
- [ ] **Go/No-Go:** If auth fails in 2 hours, plan to use direct Base Sepolia tx and write FEEDBACK.md for the $500 bounty

### Decision: Record all Day 0 findings
After validation, update the Risk Table in `docs/design/tonagent-design.md` with confirmed status for each dependency.

---

## Day 1 (April 27) — AXL P2P Communication

**Goal:** Agent A sends a message to Agent B over AXL. Both are local processes.

```
File: axl-node/node-a.ts
File: axl-node/node-b.ts
File: axl-node/setup.sh
File: ton-agent-sdk/src/comm.ts
```

### `comm.ts` interface

```typescript
interface AgentComm {
  start(nodeConfig: AXLNodeConfig): Promise<void>;
  sendMessage(to: string, msg: AXLMessage): Promise<void>;
  onMessage(handler: (msg: AXLMessage) => void): void;
  stop(): Promise<void>;
}
```

### Done when
- [ ] `node-a.ts` and `node-b.ts` start as separate processes on different ports
- [ ] Agent A sends `{ type: "discovery", from: "tonagent.eth", to: "broadcast", payload: {} }`
- [ ] Agent B receives the message and logs it
- [ ] Gensyn's cross-node requirement is satisfied by these two processes

---

## Day 2 (April 28) — TON Storage + ENS Bridge

**Goal:** Agent saves memory to TON Storage, updates ENS text record. Other agent can resolve ENS and read the memory.

```
File: ton-agent-sdk/src/storage.ts
File: ton-agent-sdk/src/identity.ts
```

### `storage.ts` interface

```typescript
interface AgentStorage {
  saveMemory(memory: AgentMemory): Promise<string>;  // returns bagId
  loadMemory(bagId: string): Promise<AgentMemory>;
}
```

Implementation: thin wrapper around `sovereign-deploy-kit`'s upload/download functions.

### `identity.ts` interface

```typescript
interface AgentIdentity {
  updateMemoryBag(ensName: string, bagId: string): Promise<void>;
  resolveMemoryBag(ensName: string): Promise<string>;  // returns bagId
}
```

Implementation: viem + ENS SDK. ENS text record key: `ton_memory_bag`. Value: `bagid:<hex>`.

### Done when
- [ ] `saveMemory()` returns a bag ID without error
- [ ] `loadMemory(bagId)` returns the same JSON that was saved
- [ ] `updateMemoryBag("tonagent.eth", bagId)` writes to Sepolia ENS text record
- [ ] `resolveMemoryBag("tonagent.eth")` returns the same bag ID

---

## Day 3 (April 29) — End-to-End Demo Script

**Goal:** The full flow runs in one script with no manual steps. This is the core of the video demo.

```
File: demo/run.ts
```

### Demo flow

```
1. Agent A: saveMemory({ agentId: "tonagent.eth", memory: { task: "completed", result: 42 } })
   → bagId returned

2. Agent A: updateMemoryBag("tonagent.eth", bagId)
   → ENS Sepolia text record updated

3. Agent A: sendMessage({ to: "otheragent.eth", type: "discovery", payload: { ens: "tonagent.eth" } })
   → AXL message sent

4. Agent B: receives message from Agent A
   → resolveMemoryBag("tonagent.eth") → gets bagId
   → loadMemory(bagId) → gets { task: "completed", result: 42 }
   → logs: "Retrieved Agent A's memory: { task: 'completed', result: 42 }"
```

### Done when
- [ ] Full flow runs with `bun run demo/run.ts` (or `ts-node demo/run.ts`)
- [ ] Each step produces a clear log line (for demo video readability)
- [ ] Flow completes in under 60 seconds (TON Storage propagation aside)

---

## Day 4 (April 30) — KeeperHub Execution Layer

**Goal:** Agent triggers an onchain action via KeeperHub.

```
File: contracts/AgentEvent.sol
File: ton-agent-sdk/src/executor.ts
```

### `AgentEvent.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentEvent {
    event AgentActionExecuted(address indexed agent, string memory actionId, uint256 timestamp);

    function emitEvent(string calldata actionId) external {
        emit AgentActionExecuted(msg.sender, actionId, block.timestamp);
    }
}
```

Deploy to Base Sepolia. Record contract address.

### `executor.ts` interface

```typescript
interface AgentExecutor {
  registerJob(action: AgentAction): Promise<string>;  // returns jobId
  getJobStatus(jobId: string): Promise<JobStatus>;
}
```

### Done when
- [ ] `AgentEvent.sol` deployed to Base Sepolia
- [ ] KeeperHub job registered via `executor.ts`
- [ ] Job triggers `AgentEvent.emitEvent()` on Base Sepolia (confirm via block explorer)
- [ ] Start writing `FEEDBACK.md` (KeeperHub DX notes)

---

## Day 5 (May 1) — Buffer + FEEDBACK.md

This day exists to absorb slippage from Days 1-4. Do not pre-schedule real features here.

**Definite tasks:**
- [ ] Write `FEEDBACK.md` for Gensyn (AXL DX: setup friction, missing docs, bugs)
- [ ] Write `FEEDBACK.md` for KeeperHub (API friction, docs gaps)
- [ ] `README.md` first draft

**If on schedule:** Polish error handling in `comm.ts`, `storage.ts`, `identity.ts`.

**If KeeperHub failed on Day 4:** Replace with direct Base Sepolia transaction in demo script. Still submit `FEEDBACK.md` for the $500 bounty — this is independent of prize placement.

---

## Day 6 (May 2) — Demo Video

**Goal:** 2-4 minute demo video that can be submitted to ETHGlobal showcase.

### Video structure (suggested)

| Timestamp | Content |
|---|---|
| 0:00 – 0:30 | Explain the problem: "AI agents are censored the same way frontends are" |
| 0:30 – 1:00 | Show the architecture diagram (ENS → TON bag → AXL → KeeperHub) |
| 1:00 – 2:30 | Live terminal demo: run `demo/run.ts`, show each step completing |
| 2:30 – 3:30 | Show the ENS text record on-chain (Etherscan Sepolia) and the KeeperHub job |
| 3:30 – 4:00 | Closing: "This is what 'Can't be evil' means for AI agents" |

### Recording tips
- Use a readable terminal font (at least 14pt)
- Add a log prefix to each step: `[storage]`, `[ens]`, `[axl]`, `[keeperhub]`
- If TON Storage propagation is slow during recording, use pre-uploaded bag

---

## Day 7 (May 3) — Submit

**Deadline: 12:00 PM EDT**

### Checklist

- [ ] GitHub repository is public
- [ ] `README.md` includes: setup instructions, architecture diagram, contract addresses, demo video link
- [ ] `FEEDBACK.md` is in the repo root (required by both Gensyn and KeeperHub)
- [ ] ETHGlobal showcase submission:
  - Project title: TonAgent
  - Description: 2-paragraph pitch
  - Demo video: uploaded
  - GitHub link: added
  - Contract addresses: Base Sepolia `AgentEvent.sol`
  - Tracks selected (max 3): **ENS**, **Gensyn**, **KeeperHub**
  - Team member info

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript | ENS SDK, viem, existing sovereign-deploy-kit are TS |
| Runtime | Bun | Fastest TS runtime, consistent with existing projects |
| EVM | viem | ENS SDK integration, type-safe |
| ENS | @ensdomains/ensjs | Official SDK |
| Contracts | Hardhat | Existing setup in demo-dapp/ |
| Smart contract | Solidity ^0.8.20 | Standard |
| TON Storage | sovereign-deploy-kit | Already implemented and tested |
| AXL | AXL SDK (TBD — see Day 0 validation) | Gensyn's library |
| KeeperHub | KeeperHub REST API | Direct HTTP calls |

---

## Environment Variables

```bash
# .env (never commit)
PRIVATE_KEY=0x...           # Sepolia + Base Sepolia wallet (funded)
SEPOLIA_RPC_URL=https://...
BASE_SEPOLIA_RPC_URL=https://...
ENS_NAME=tonagent.eth
KEEPERHUB_API_KEY=...
AGENT_EVENT_CONTRACT=0x...  # filled after Day 4 deploy
```

---

## Submission Tracks

**ENS** — "Most Creative Use of ENS"  
The ENS text record (`ton_memory_bag`) acts as a censorship-resistant pointer between an agent's EVM identity and its decentralized memory on TON Storage. This is not standard name resolution — it's a cross-chain identity bridge.

**Gensyn** — "Best Application of Agent eXchange Layer (AXL)"  
Two separate AXL node processes exchange typed agent messages (discovery, memory_request, memory_response). No centralized message broker. AXL is the only communication channel between Agent A and Agent B.

**KeeperHub** — "Best Use of KeeperHub" + Builder Feedback Bounty  
KeeperHub triggers `AgentEvent.emitEvent()` on Base Sepolia as the final step of the agent pipeline. The `FEEDBACK.md` documents real DX friction encountered during integration.
