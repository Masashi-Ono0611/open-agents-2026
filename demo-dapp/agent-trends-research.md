# AI Agent Trend Research — April 2026

*Source: Training knowledge through August 2025. Verify latest docs before building.*

---

## 1. Anthropic

### Computer Use API (GA, early 2025)
Claude controls desktops natively — screenshot → reason → click/type, in a loop. Called via `computer_use` tool in the API. No browser plugin required; runs in a sandboxed VM. Key for agents that need to interact with UIs that have no API.

### Claude Agent SDK
First-party Python/TypeScript SDK for agent builders:
- `Agent` class with built-in tool-use loop
- `Memory` abstractions (in-context + external)
- `Tool` decorator wrapping Python functions
- Multi-agent **subagent handoffs** — orchestrator delegates to specialist subagents
- Native MCP server integration as tool sources

### Model Context Protocol (MCP)
Breakout year in 2025. 1,000+ community servers published (GitHub, Postgres, Brave Search, Puppeteer, Slack, Linear, etc.). Every major framework added MCP adapters. Key evolution: **Remote MCP** (OAuth over HTTPS) enables production deployments without local server management.

### Extended Thinking (Claude 3.7)
Variable token budget for pre-response reasoning. Significantly improves multi-step planning reliability for agentic tasks.

### Commerce / Shopping Agents
No branded Anthropic "commerce agent" product shipped (as of Aug 2025). Activity was through **Computer Use** navigating e-commerce UIs and **Claude on AWS Bedrock** powering retailer shopping assistants.

---

## 2. OpenAI

### Responses API + Agents SDK (March 2025)
Replaces Assistants API. Stateful, built-in tools: `web_search`, `file_search`, `computer_use`, `code_interpreter`. Python/TypeScript **Agents SDK** adds `Agent`, `Runner`, `Handoff` primitives. Handoffs = one agent delegates to another with typed context passing. This is the most polished multi-agent developer surface available.

### Operator (January 2025)
Consumer product (ChatGPT Pro). Cloud-VM Chromium browser agent using vision → action loop. CUA (Computer-Using Agent) model fine-tuned on screenshots + action sequences. Research API preview available, not GA for developers.

### GPT-4o Realtime API
Persistent WebSocket sessions, sub-300ms audio latency, tool calling inside Realtime sessions. Enables voice-driven agentic workflows.

---

## 3. Google / DeepMind

### Agent2Agent (A2A) Protocol (April 2025) — Most Important
Open HTTP standard for cross-vendor agent interoperability. 50+ companies at launch.
- Each agent publishes an **Agent Card** at `/.well-known/agent.json` (capabilities, auth, I/O types)
- Communication via **Tasks** over HTTPS + SSE streaming
- Auth: OAuth 2.0, API keys, or none
- Complements MCP (MCP = model↔tool, A2A = agent↔agent)
- ADK (Agent Development Kit): Google's open-source Python framework with built-in A2A support

### Project Mariner
Gemini 2.0-powered browser agent running inside Chrome as an extension. Operates on the user's local browser session (has cookies, logged-in accounts). Multi-step web task automation.

### Gemini 2.5 Pro
1M token context window. Strong for indexing large on-chain datasets (ABI libraries, transaction histories, governance proposals) in a single prompt.

---

## 4. Multi-Agent Frameworks

### LangGraph
De facto production choice for stateful multi-agent. Key 2025 additions:
- **LangGraph Platform**: managed hosting, durable execution, checkpointing, human-in-the-loop pause/resume
- **LangGraph Studio**: visual debugger for graph state
- Subgraph support for reusable agent modules
- Fastest to debug a multi-agent flow in a hackathon via `langgraph dev` + Studio

### AG2 (AutoGen rewrite)
Async event-driven runtime. Composable team topologies (swarm, selector, round-robin). First-class MCP tool support.

### CrewAI
Fastest to go from zero to working role-based crew (Researcher + Writer + Validator) in under 2 hours. CrewAI Flows adds event-driven orchestration mixing structured pipelines with crew autonomy.

### Memory Stack (standardized in 2025)
| Tier | Tool | Use case |
|------|------|---------|
| In-context | System prompt | Working memory, volatile |
| Short-term | Redis / Upstash | Session state, fast key-value |
| Long-term semantic | pgvector / Pinecone | Episodic recall, similarity search |
| Drop-in layer | **Mem0** | Auto-extracts + retrieves memories across sessions |

### Key Tools for Agents
| Category | Top picks |
|----------|-----------|
| Web search | Exa (quality), Tavily, Brave |
| Code execution | E2B sandbox, Modal |
| Browser automation | Playwright via Stagehand, Browser Use |
| RAG | pgvector + HyDE + Cohere reranker |
| Evals | LangSmith, Braintrust |

### Agentic RAG Patterns
- **GraphRAG** (Microsoft): knowledge graph from corpus, multi-hop queries
- **CRAG**: agent scores retrieved docs, re-queries if confidence low
- **HyDE**: generate hypothetical answer first, use as query vector (+10-15% recall)

---

## 5. Web3 AI Agents

### On-Chain Agent Frameworks

**ElizaOS / ai16z** — Most-forked open-source agent framework of 2025.
- `plugin-evm` and `plugin-solana` give agents direct wallet + on-chain action capabilities from LLM tool calls
- Agent has its own wallet, reads on-chain state, executes transactions autonomously
- Best hackathon starting point for a "Web3-native agent"

**Virtuals Protocol** (Base) — Dominant "agent launchpad" narrative.
- Each agent gets an ERC-20 governance token on a bonding curve
- Inference fees accumulate in an "agent contribution vault" and are distributed on-chain
- $500M+ agent token market cap by early 2025
- GAME framework: multi-agent orchestration for swarms of tokenized agents

**Autonolas / Olas Network** — Most production-ready trustless agent architecture.
- Multi-agent services bonded via on-chain **Safe multisig**
- Quorum of agents must agree before any transaction executes
- Runs on Ethereum + Gnosis

**Ritual** — Most technically novel: on-chain ML inference.
- Solidity contracts call `requestCompute()` — off-chain node runs the model and posts result back via callback
- Removes oracle middleman for AI inference in smart contracts
- Infernet SDK for integration

### Agent Wallets & Payments

**Coinbase AgentKit** (Base) — Most widely used at hackathons (~30% of Base submissions in 2025).
- One-click agent wallet creation with MPC backing
- Built-in USDC receive/send, onramp
- CDP Wallet API: REST API for programmatic wallet creation per agent

**x402 Protocol** (Coinbase) — HTTP 402 "Payment Required" for agent micropayments.
- Agent requests resource → gets 402 with payment request → pays USDC on Base → retries
- Standard HTTP, no SDK needed on payee side
- Enables agent-to-agent service payments at scale

**Lit Protocol** — Programmable key management.
- Agent private key split via threshold cryptography
- Key only reconstructable when on-chain conditions are met
- "Conditional agent wallets" — agent can only spend when X is true on-chain

**Skyfire** — Agent payment network.
- Pre-issued USDC balance per agent, metered billing for AI API calls

### Agent Identity

**ERC-6551 (Token Bound Accounts)** — Any NFT gets a smart contract wallet.
- Agent-NFT can hold assets, sign transactions, accumulate history under its own address
- Table stakes pattern for NFT-based agent identity

**ERC-4337 (Account Abstraction)** — Smart contract wallets for agents.
- Session keys for delegated access
- Pay gas in ERC-20 tokens via paymasters
- Now standard for production agent wallets

**did:pkh** — Simplest DID method for EVM agents. Any EOA is automatically a DID.

**UCAN (User Controlled Authorization Networks)** — Capability-based auth.
- Orchestrator delegates a subset of on-chain capabilities to sub-agents without sharing the private key
- Chain-of-trust delegation for multi-agent systems

**Chainlink CCIP** — Cross-chain reach for agents.
- Agent on one chain triggers actions on another without bridging assets
- Used in winning projects at ETHGlobal 2025

### New Protocols

| Protocol | What it does |
|----------|-------------|
| **AXL** (Gensyn) | libp2p P2P agent comms, no central broker |
| **A2A** (Google) | HTTP standard, Agent Cards, cross-vendor agent calls |
| **x402** (Coinbase) | HTTP 402 micropayment standard for agents |
| **MCP** (Anthropic) | Model-to-tool standard, 1000+ servers |
| **OpenAgents Protocol** | JSON schema for capability advertisement |

---

## 6. Winning Hackathon Archetypes (ETHGlobal 2025)

1. **AI agent with its own wallet doing DeFi** — reads prices, swaps via Uniswap, holds yield. Coinbase AgentKit + Uniswap hooks = most common stack.
2. **Multi-agent swarm with P2P coordination** — orchestrator pays worker agents in USDC via x402 for subtask completion
3. **Agent identity + ENS registry** — agents register capabilities as ENS text records, discovery UI
4. **ZK-verified agent credentials** — agent proves safety eval pass / KYC without revealing internals (Polygon ID, SP1 zkVM)
5. **iNFT with transferable memory** — ERC-7857 agent packaged and sold with full memory continuity
6. **On-chain agent action log** — every agent decision emits structured on-chain events, auditable trail

---

## 7. Project Ideas for ETHGlobal Open Agents

### Idea A: "Commerce Agent" (inspired by Anthropic's direction)
Agent autonomously shops for on-chain services/assets.
- User describes goal in natural language
- Agent discovers providers via **ENS text record registry** (`agent.capabilities`, `agent.pricing`)
- Negotiates and pays via **x402 Protocol** (USDC on Base)
- Executes purchases via **Uniswap Universal Router**
- Schedules recurring purchases via **KeeperHub**
- Agent identity as **ERC-7857 iNFT** with memory in **0G KV Store**
- **Sponsors hit:** 0G + Uniswap + ENS + KeeperHub

### Idea B: "Decentralized Agent Marketplace"
A2A-compatible registry where agents list and hire each other.
- Agents publish **A2A Agent Cards** anchored via ENS subdomain
- Discovery via ENS text records + on-chain registry
- Agent-to-agent task delegation via **AXL** (Gensyn)
- Payments via x402 / USDC
- Memory state stored in **0G KV Store**
- **Sponsors hit:** 0G + Gensyn + ENS

### Idea C: "Self-Owning DeFi Agent" (iNFT + Uniswap v4)
An agent that autonomously manages a DeFi portfolio and can be sold as an NFT.
- **ERC-7857 iNFT** = agent identity + model commitment + memory capsule
- **ERC-6551 TBA** = agent's own wallet holding assets
- **Uniswap v4 custom hook** = logs every agent trade on-chain (transparency requirement)
- **0G KV Store** = trading history and strategy memory
- **KeeperHub** = scheduled rebalancing triggers
- **Sponsors hit:** 0G + Uniswap + KeeperHub

### Idea D: "Multi-Agent Research Swarm with Verifiable Credentials"
Specialized agents collaborate via P2P, credentials verified on-chain.
- Researcher / Coder / Verifier agents each run on separate **AXL nodes** (Gensyn)
- Each agent identified by an **ENS subdomain** (`researcher.myswarm.eth`)
- ZK credentials proving each agent's specialization (creative ENS track)
- Findings stored in **0G KV Store** for cross-agent memory sharing
- **Sponsors hit:** 0G + Gensyn + ENS

### Idea E: "On-Chain Agent Execution Scheduler" (KeeperHub-native)
Agents register long-running jobs that KeeperHub executes when conditions are met.
- Natural language → on-chain job registration
- **KeeperHub** triggers execution at the right moment (price threshold, time, event)
- **Uniswap hooks** for the actual DeFi execution
- Agent plans stored in **0G KV Store**
- Results reported via **ENS text record updates**
- **Sponsors hit:** KeeperHub + Uniswap + 0G + ENS

---

## Key Stack Recommendations

### "Fast to demo" stack (24h)
```
ElizaOS plugin-evm  +  Coinbase AgentKit  +  Uniswap Routing API
+  ENS viem built-ins  +  0G KV Store  +  RainbowKit frontend
```

### "Technically impressive" stack (48h)
```
LangGraph orchestrator  +  MCP servers (on-chain tools)
+  AXL P2P nodes (2 Docker containers)  +  ERC-7857 iNFT
+  Uniswap v4 custom hook  +  Mem0 for agent memory
```

### Almost-free bonus prizes
- Add KeeperHub integration + submit `FEEDBACK.md` → +$500-750
- Write thorough Uniswap `FEEDBACK.md` → +$500
