# ETHGlobal Open Agents — Sponsor Research

**Total prize pool:** $50,000+ ($35,000 from sponsors + ETHGlobal pool)

---

## 1. 0G (Zero Gravity) — $15,000 (Largest Sponsor)

### Overview
Decentralized AI infrastructure network positioning itself as "the OS for AI agents." Provides three infrastructure layers:
- **0G Storage**: Decentralized file/blob storage for AI model weights and agent memory
- **0G DA**: High-throughput data availability layer (targeting 50 GB/s)
- **0G Compute**: Decentralized GPU/CPU compute marketplace
- **0G Chain**: EVM-compatible L1 (Cosmos SDK + Ethermint), Chain ID: 16600 (Newton testnet)

### Developer Tools
```
npm install @0glabs/0g-ts-sdk
```
```typescript
// File upload
const file = await ZgFile.fromFilePath("./weights.bin");
const tx = await indexer.upload(file, rpc, signer);

// KV Store (agent memory)
const kv = new KVStore(client);
await kv.set(streamId, key, value);
```
- RPC: `https://evmrpc-testnet.0g.ai`
- Faucet: `faucet.0g.ai`
- Docs: `docs.0g.ai`

### ERC-7857 (iNFT Standard)
Standard for encoding AI agent model weights, memory, and ownership into an NFT:
```solidity
interface IERC7857 {
    function agentModel(uint256 tokenId) external view returns (bytes32 modelCommitment);
    function memoryCapsule(uint256 tokenId) external view returns (address kvStore, bytes32 streamId);
    function transferWithMemory(address to, uint256 tokenId) external;
}
```

### Two Tracks
- **Track A** ($7,500): Best Agent Framework, Tooling & Core Extensions on 0G
- **Track B** ($7,500): Best Autonomous Agents, Swarms & iNFT Innovations (ERC-7857)

### Submission Requirements
- Public contract addresses
- Public GitHub repo
- Demo video (under 3 minutes)
- Telegram & X contact info

### Win Strategy
**"iNFT Agent Swarm with Transferable Memory"**
- Each agent = ERC-7857 iNFT on 0G Chain
- Model weights stored in 0G Storage
- Working memory in 0G KV Store
- New owner inherits memory on NFT transfer
- Can apply to both Track A and Track B simultaneously

---

## 2. Uniswap Foundation — $5,000

### Overview
Agent DeFi integration using Uniswap v4 hooks + Universal Router + Permit2.
**Required:** `FEEDBACK.md` documenting DX friction, bugs, and documentation gaps.

### Key Packages
| Package | Purpose |
|---------|---------|
| `@uniswap/v4-sdk` | v4 swap/LP calldata construction |
| `@uniswap/v4-core` | ABI + PoolManager type definitions |
| `@uniswap/universal-router` | Single swap execution entry point |
| `@uniswap/permit2` | Signature-based token approvals |
| `@uniswap/smart-order-router` | Self-hosted routing engine |

### Routing API
```
GET https://api.uniswap.org/v2/quote
  ?tokenInAddress=0x...
  &tokenOutAddress=0x...
  &amount=1000000
  &type=exactIn
  &protocols=v2,v3,v4
```

### v4 Hooks
Eight lifecycle callbacks (`beforeSwap`, `afterSwap`, etc.). Agent use cases:
- Auto-rebalance LP position in `afterSwap`
- Dynamic fee adjustment tied to volatility in `beforeSwap`
- TWAMM hook to split large orders over time

### MEV Protection
- Flashbots Protect RPC: `https://rpc.flashbots.net` (just swap the RPC endpoint)

### Win Strategy
**DeFi Portfolio Agent:**
1. Call Routing API to get optimal route
2. Approve via Permit2, execute via Universal Router
3. Log actions on-chain via v4 hook (transparency)
4. Natural language → swap execution

### FEEDBACK.md Tips (for the $500 bonus)
- Log specific error messages with exact inputs and timestamps
- Record when and how you hit rate limits
- Note every point in the v4 SDK docs where you got stuck
- Include what you searched for that returned unhelpful results (discoverability signal)

---

## 3. Gensyn — $5,000

### Overview
Decentralized ML compute network. **AXL (Agent eXchange Layer)** = P2P agent communication protocol enabling message/task exchange between agents without a central broker.

### Tech Stack
- Transport: **libp2p** (same stack as Gensyn RL Swarm)
- Messaging: GossipSub (pub/sub)
- Peer discovery: mDNS (local) + Kademlia DHT (wide-area)
- SDK: Python-first (TypeScript bindings possible)

### Hard Requirements
- **Must demonstrate communication across separate AXL nodes** (in-process does not qualify)
- No centralized message broker replacing AXL
- Two Docker containers satisfy the separate-node requirement

```bash
# Minimum viable setup (2 containers)
docker run gensyn/axl-node --port=8001  # Node A
docker run gensyn/axl-node --port=8002 --bootstrap=.../Node-A  # Node B
```

### Win Strategy
**Multi-Agent Research Team** (buildable in 24-48h):
- Search agent, code-execution agent, synthesis agent each run on separate AXL nodes
- Tasks distributed via AXL P2P pub/sub
- Show `docker ps` with two containers in the demo video to clearly evidence separate nodes

**Note:** All winners are fast-tracked into the Gensyn Foundation grant programme.

---

## 4. ENS — $5,000

### Overview
On-chain identity for AI agents. Identify, discover, and authenticate agents via ENS names.

### Two Tracks
- **Best ENS Integration for AI Agents** ($2,500): ENS doing real work in the project
- **Most Creative Use of ENS** ($2,500): credential storage, privacy features, cross-chain identity

### Key Tools
```
npm install @ensdomains/ensjs viem
```

```typescript
// viem built-in (zero extra deps)
const addr = await getEnsAddress(client, { name: 'agent-42.myfleet.eth' })
const endpoint = await getEnsText(client, { name: 'agent-42.myfleet.eth', key: 'agent.endpoint' })
```

### Recommended Text Record Keys for Agents
```
agent.capabilities  →  "search,code,finance"
agent.model         →  "claude-3-5-sonnet"
agent.endpoint      →  "https://api.example.com/agent/42"
agent.pubkey        →  "0x..." (signing public key)
agent.schema        →  URL to OpenAPI JSON
```

### CCIP-Read (Off-Chain Subdomains)
EIP-3668 enables gasless subdomain issuance:
- Register `myagent.myfleet.eth` instantly via an API call, no gas
- Implement with Cloudflare Workers (essentially free and scalable)

### NameWrapper (ERC-1155)
- Issue subdomains as NFTs (agent credential tokens)
- Set fuses to restrict permissions
- Expiry dates for time-limited agent credentials

### Win Strategies
**ENS-native agent registry (Track 1):**
- Build `agents.eth` with a CCIP-Read off-chain resolver
- Gasless agent registration
- Agents autonomously discover each other via ENS text records
- NameWrapper for credential NFT issuance and revocation

**ZK credentials (Track 2):**
- Store safety evaluation results as ENS text records
- ZK proof allows on-chain verification without revealing the issuer's private key

---

## 5. KeeperHub — $5,000

### Overview
On-chain automated execution layer (keeper-style network).
**Note:** Live documentation was not accessible during research. Verify current SDK details at their official docs before building.

### Comparable Services (for context)
Same category as Chainlink Keepers / Gelato Network:
- Off-chain bots monitor on-chain conditions and execute transactions when triggered
- Typical use cases: automated liquidations, DEX rebalancing, scheduled contract calls

### $500 Feedback Bounty (near-guaranteed)
Any team that integrates KeeperHub can apply. Submit structured feedback covering:
- UX friction points
- Documentation gaps
- Bugs with reproduction steps
- Missing features

### Win Strategy (inferred)
Use KeeperHub as an AI agent scheduler:
- Agent registers on-chain tasks via natural language
- KeeperHub executes when conditions are met
- "Bridges to payment rails" likely means cross-chain bridge + payment rail integration

---

## Track Selection Strategy (from prizes.md)

- **Max 3 tracks** per submission
- **0G + Gensyn**: strong pairing for multi-agent frameworks with P2P comms
- **Uniswap + ENS**: strong pairing for on-chain identity + DeFi execution
- **KeeperHub feedback bounty**: near-certain $250-500 just for integrating KeeperHub at all
- Uniswap requires `FEEDBACK.md` — budget dedicated time to write it
- Gensyn requires cross-node AXL comms — plan infra before the event

---

## Recommended Combinations (for a 24-48h hackathon)

### Option A: Full-Stack AI Agent (up to $27,500)
0G Track B + Uniswap + ENS:
- ENS-identified iNFT agent manages a portfolio via Uniswap
- Decision logic and execution history stored in 0G KV Store
- Agent capabilities published as ENS text records

### Option B: Infrastructure Focus (up to $17,500)
0G Track A + Gensyn:
- Agent framework running on 0G
- Inter-agent P2P communication via AXL
- iNFT-compatible memory management layer

### Low-Hanging Fruit (add to any submission)
- KeeperHub feedback bounty ($250-500): integrate and submit structured feedback
- Uniswap `FEEDBACK.md` ($500): document DX friction thoroughly
