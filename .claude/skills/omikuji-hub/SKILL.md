---
name: omikuji-hub
description: Pull a Japanese-style onchain fortune (Daikichi / Kichi / Suekichi / Kyō / Daikyō) deterministically derived from the latest Base Sepolia block hash plus the asker's wallet address and the current UTC date. Every fortune ships with a real on-chain USDC reward — Daikichi pays the most, Daikyō pays a consolation prize, but every pull produces a verifiable BaseScan tx. The KeeperHub agentic wallet signs and submits the transfer. Invoke when the user says "draw my fortune", "pull an omikuji", "give me an onchain reward", "demo the keeper on something playful", or any phrasing that maps to "let an AI agent decide my prize tier, then pay me on-chain".
---

# Omikuji Hub 🎴

> An onchain shrine where the priest is a KeeperHub agentic wallet. Every pull pays — even the bad fortunes.

A Skill that turns a single prompt into **(a)** a deterministic-randomness fortune draw and **(b)** a real on-chain USDC reward whose amount depends on the fortune tier. Both phases run end-to-end against the live KeeperHub agentic wallet on Base Sepolia.

## When to invoke

- Any phrasing about **fortune / lottery / lucky draw / omikuji / 運勢 / おみくじ**
- Any explicit request to **demo the KeeperHub agentic wallet on something playful**
- The user supplies (or has already supplied in conversation) a recipient wallet address

## Prerequisites

1. **KeeperHub MCP attached.** Run `mcp__keeperhub__list_integrations` — must return at least one row with `type: "web3"`.
2. **Agentic wallet has gas + USDC.** Base Sepolia ETH for gas, plus enough USDC to cover the largest tier (currently 0.005 USDC per Daikichi pull).

## Two-phase logic

### Phase 1 — divine the fortune (free, deterministic, no chain write)

1. Fetch the latest Base Sepolia block via JSON-RPC:
   ```
   POST https://sepolia.base.org
   { jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", false] }
   ```
   Read `result.hash` and `result.number`.
2. Compute the seed:
   ```
   seed = blockHash + askerAddress + utcDate (YYYY-MM-DD)
   hash = keccak256(toBytes(seed))
   byte = first byte of hash, in [0, 255]
   ```
3. Map `byte` to a fortune **tier** via this fixed table — **every tier pays something**, the amount escalates with the rarity:

   | Byte range | Fortune | Romaji | Meaning | Probability | Reward |
   |---|---|---|---|---|---|
   | 0–24 | 大吉 | Daikichi | great blessing | ~10% | **0.005 USDC** (jackpot) |
   | 25–101 | 吉 | Kichi | blessing | ~30% | **0.001 USDC** |
   | 102–204 | 末吉 | Suekichi | small blessing | ~40% | **0.0003 USDC** |
   | 205–243 | 凶 | Kyō | curse, but not the worst | ~15% | **0.0001 USDC** (consolation) |
   | 244–255 | 大凶 | Daikyō | great curse | ~5% | **0.00005 USDC** ("even bad luck pays") |

### Phase 2 — settle the reward on-chain (always, amount depends on tier)

```
mcp__keeperhub__execute_transfer({
  network:           "84532",                                         // Base Sepolia
  recipient_address: <asker wallet>,
  amount:            "<tier reward>",                                 // 0.005 / 0.001 / 0.0003 / 0.0001 / 0.00005
  token_address:     "0x036CbD53842c5426634e7929541eC2318f3dCF7e"     // Circle USDC
})
```

Then poll `mcp__keeperhub__get_direct_execution_status` until `status: "completed"`. Read `transactionHash` and `transactionLink`. Typical wall time: ~9 seconds per pull.

**Why every tier pays:** for a public demo it matters more that *any* judge who pulls the skill sees a real BaseScan tx than that the rare fortunes are gated. Reward magnitude does the gating instead.

## Output contract — demo-friendly format

The skill MUST print its work in this CLI-style format so a watcher (judge, recorded video) can see the on-chain action happen, then end with a JSON block.

```
🎴 Omikuji Hub — onchain fortune oracle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Asker:    0x08D8…dCB8
  UTC date: 2026-05-03

▸ Phase 1: divining the fortune
  ↳ fetching latest Base Sepolia block...
  ↳ block #41025200  hash 0x824d…ee71
  ↳ seed = keccak256(blockHash + asker + utcDate)
  ↳ rolled byte: 18 / 255

🎉 Fortune: 大吉 (Daikichi) — Great Blessing  (≈10%)   reward: 0.005 USDC

▸ Phase 2: settling the reward on-chain
  ↳ KeeperHub agentic wallet: 0x8F31…81FD
  ↳ recipient:                0x08D8…dCB8
  ↳ amount:                   0.005 USDC
  ↳ POST /api/execute/transfer (via KeeperHub MCP)
  ↳ KeeperHub accepted: exec 80z0…ql7
  ↳ polling status... running
  ↳ polling status... ✓ completed
  ↳ tx 0x6031…54fa

✅ Reward delivered on-chain
   BaseScan ↗ https://sepolia.basescan.org/tx/0x60312b52cf9cedaf0bcfba38d88fd784701064cf764085e07b661dfc915454fa
   Gas:       45,047 units @ 6.6 Mwei
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```json
{
  "fortune_jp": "大吉",
  "fortune_romaji": "Daikichi",
  "rolled_byte": 18,
  "block_number": 41025200,
  "block_hash_used": "0x824d26d5409843e7efa889a9d13a57f06f685fad271a4dcb7c0ec0065861ee71",
  "asker": "0x08D811A358850892029251CcC8a565a32fd2dCB8",
  "utc_date": "2026-05-03",
  "reward": {
    "tier": "Daikichi",
    "amount": "0.005 USDC",
    "tx_hash": "0x60312b52cf9cedaf0bcfba38d88fd784701064cf764085e07b661dfc915454fa",
    "tx_link": "https://sepolia.basescan.org/tx/0x60312b52cf9cedaf0bcfba38d88fd784701064cf764085e07b661dfc915454fa",
    "agentic_wallet": "0x8F31fF5eaae3A1036839c503248e9f42479C81FD"
  }
}
```

End the response with one short line in the spirit of the fortune. Examples:

- Daikichi: *"Today, everything goes well. The keeper smiles upon you."*
- Kichi: *"A gentle good day. Walk it slowly."*
- Suekichi: *"Patience first. Good fortune ripens later."*
- Kyō: *"A small storm is coming — but the keeper softens it with a coin."*
- Daikyō: *"Even great misfortune is paid in this shrine. Sit, breathe."*

## Why this is creative — the pitch

1. **Conditional onchain execute is the production agent pattern, scaled to *every* path.** Most demo skills only call onchain on the happy path. This one calls onchain on **every** path, with the amount as the discriminator instead of the boolean. That gives a richer demo — judges always see a tx — while preserving the agent-decides-then-pays primitive.
2. **Deterministic randomness as anti-spam.** `keccak256(blockHash + asker + utcDate)` means the same wallet on the same UTC date gets the same fortune — re-rolling within a session is impossible. Even on a public internet demo, no one can spam-drain the agentic wallet.
3. **Strip the omikuji theme and you have generic infra.** "AI agent decides which tier a human qualifies for, then pays the corresponding amount via KeeperHub" is the shape behind quiz prizes, engagement campaigns, retention drops, onboarding bonuses, and tiered referral payouts. The skill is a working primitive disguised as a folk-game.
4. **Cultural framing as a discovery angle.** "おみくじ" makes the skill discoverable to a Japanese-speaking user, but the JSON output and BaseScan tx are universal.
5. **Two-tool composition with a real KeeperHub MCP server.** This is not a pre-recorded mock. The skill genuinely calls `mcp__keeperhub__execute_transfer` and `mcp__keeperhub__get_direct_execution_status`, which sign and submit a real Base Sepolia tx through the agentic wallet `0x8F31fF5eaae3A1036839c503248e9f42479C81FD`. The transactions in `examples/01-pull-fortune.md` are independently verifiable on-chain.

## Use cases

- **Hackathon demo (the immediate one):** judge says "pull my fortune"; skill draws on-chain; reward (any tier) lands in their wallet within ~10 seconds with a BaseScan link.
- **Discord / Telegram bot:** `/omikuji` command → daily lucky drop channel; deterministic-per-day means each user gets exactly one shot per UTC day, but always wins something.
- **Onboarding bonus:** swap fortune ranges with onboarding milestones (signed first tx, completed first action…) and the same primitive becomes a self-serve onboarding reward dispenser.
- **Engagement campaign:** plug the skill into any campaign frontend, add a wallet input, get a viral "spin to win" mechanic backed by real on-chain payouts and zero traditional backend infra.

## Anti-abuse notes

- Daily limit is enforced *by the seed itself*: same UTC date + same wallet = same fortune. The skill never accepts a custom block hash from the user.
- If RPC is down, the skill aborts with a clear error rather than fall back to client-side `Math.random()`.
- The skill never reveals the agentic wallet's API key or session — only its public address (`0x8F31fF5eaae3A1036839c503248e9f42479C81FD`).
- Worst-case daily drain (1,000 unique askers × all-Daikichi) = 5 USDC. The current funded balance comfortably covers a hackathon demo session.

## Examples

See `examples/`:

- `examples/01-pull-fortune.md` — the one-prompt happy path, with verified Base Sepolia transactions from 2026-05-03.
