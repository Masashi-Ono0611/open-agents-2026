# Example 01 — Pull today's fortune (live run)

## User prompt

> Pull today's omikuji for `0x08D811A358850892029251CcC8a565a32fd2dCB8`.

## What the skill prints (verbatim, demo-friendly)

```
🎴 Omikuji Hub — onchain fortune oracle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Asker:    0x08D811A358850892029251CcC8a565a32fd2dCB8
  UTC date: 2026-05-03

▸ Phase 1: divining the fortune
  ↳ fetching latest Base Sepolia block...
  ↳ block #41025200  hash 0x824d26d5409843e7efa889a9d13a57f06f685fad271a4dcb7c0ec0065861ee71
  ↳ seed = keccak256(blockHash + asker + utcDate)
  ↳ rolled byte: 18 / 255

🎉 Fortune: 大吉 (Daikichi) — Great Blessing  (≈10%)   reward: 0.005 USDC

▸ Phase 2: settling the reward on-chain
  ↳ KeeperHub agentic wallet: 0x8F31fF5eaae3A1036839c503248e9f42479C81FD
  ↳ recipient:                0x08D811A358850892029251CcC8a565a32fd2dCB8
  ↳ amount:                   0.005 USDC
  ↳ POST /api/execute/transfer (via KeeperHub MCP)
  ↳ KeeperHub accepted: exec 2b4ina1yt1qm51zqy8goh
  ↳ polling status... running
  ↳ polling status... ✓ completed
  ↳ tx 0xf31a2380f7b35202231ba1e94e97d97f7d93c203b56d05eac8a6d9cd647d019d

✅ Reward delivered on-chain
   BaseScan ↗ https://sepolia.basescan.org/tx/0xf31a2380f7b35202231ba1e94e97d97f7d93c203b56d05eac8a6d9cd647d019d
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
    "tx_hash": "0xf31a2380f7b35202231ba1e94e97d97f7d93c203b56d05eac8a6d9cd647d019d",
    "tx_link": "https://sepolia.basescan.org/tx/0xf31a2380f7b35202231ba1e94e97d97f7d93c203b56d05eac8a6d9cd647d019d",
    "agentic_wallet": "0x8F31fF5eaae3A1036839c503248e9f42479C81FD"
  }
}
```

> Today, everything goes well. The keeper smiles upon you.

---

## On-chain verification

The transaction above is **real on Base Sepolia**, not a mock. Open the BaseScan link and confirm:

- `From` is the KeeperHub agentic wallet `0x8F31fF5eaae3A1036839c503248e9f42479C81FD`
- `To` is the Circle USDC token contract `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- The decoded `transfer(0x08D8…dCB8, 5000)` event sends `5,000` raw units (= 0.005 USDC at 6 decimals) to the asker

Three more verified runs from the same testing session, with different reward amounts:

| Tx | Amount |
|---|---|
| [`0xed5c…dbc9`](https://sepolia.basescan.org/tx/0xed5c70d588dc51279c34075d30bd2765f5ec4d63c211c95f08dd92355490dbc9) | 0.001 USDC |
| [`0xb46c…f61e`](https://sepolia.basescan.org/tx/0xb46cd284067365ece167ce617eba0b67fe5c3061b6c94a9fb6d306c79cd8f61e) | 0.001 USDC |
| [`0x6031…54fa`](https://sepolia.basescan.org/tx/0x60312b52cf9cedaf0bcfba38d88fd784701064cf764085e07b661dfc915454fa) | 0.001 USDC |

(These earlier runs used a single 0.001 USDC amount before the tiered table was finalised. The tiered amounts in the table at the top of `SKILL.md` are what the skill will use going forward.)

---

## How to run Phase 1 yourself (no KeeperHub key needed)

The fortune draw is pure read + deterministic hash. Anyone with `bun` and `viem` can reproduce a fortune for any wallet on any UTC date:

```bash
cd app/keepersake/frontend  # has viem already installed
bun -e '
const ASKER = "0x08D811A358850892029251CcC8a565a32fd2dCB8";  // change me
const r = await fetch("https://sepolia.base.org", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber",
    params: ["latest", false],
  }),
});
const { result: block } = await r.json();
const today = new Date().toISOString().slice(0, 10);
const seedHex = block.hash.slice(2).toLowerCase()
              + ASKER.slice(2).toLowerCase()
              + Buffer.from(today).toString("hex");
const { keccak256, toBytes } = await import("viem");
const byte = parseInt(keccak256(toBytes("0x" + seedHex)).slice(2, 4), 16);
const fortune =
  byte <= 24  ? { name: "Daikichi 大吉",  amount: "0.005 USDC" } :
  byte <= 101 ? { name: "Kichi 吉",       amount: "0.001 USDC" } :
  byte <= 204 ? { name: "Suekichi 末吉",  amount: "0.0003 USDC" } :
  byte <= 243 ? { name: "Kyō 凶",         amount: "0.0001 USDC" } :
                { name: "Daikyō 大凶",    amount: "0.00005 USDC" };
console.log({ block: parseInt(block.number, 16), byte, ...fortune });
'
```

Phase 2 (the reward drop) requires the KeeperHub MCP server attached and an org with a funded agentic wallet — see `SKILL.md` for the prerequisites.
