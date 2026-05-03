# KeeperSake 🍶

> **An on-chain keepsake, kept by a Keeper.**
> Built for [ETHGlobal Open Agents](https://ethglobal.com/events/openagents) — KeeperHub track.

Your USDC, your final words, your heir. Commit them once and tap **"I'm alive"** as long as you are. The day you go silent past your timeout, a [KeeperHub](https://keeperhub.com/) workflow runs `execute()` on your behalf and your heir inherits — automatically, on-chain, no lawyer.

The name is a triple pun: a *keepsake* (形見) that you leave, *for the sake of* an heir, kept by a *Keeper* (the KeeperHub workflow watching your heartbeat).

## Why this exists

AI agents are starting to run real money. People are hooking up auto-trading agents, treasury managers, and on-chain workers. Nobody is asking the obvious follow-up: **what happens to your on-chain assets when *you* go silent?**

KeeperSake is the simplest possible answer. A single contract, a single button, an AI-generated KeeperHub workflow that watches your heartbeat and presses the trigger when the time comes.

## Architecture

```
Next.js 15 (Vercel)
  ├ /              — Landing
  ├ /setup         — Will commit wizard (heir / amount / note / timeout)
  ├ /dashboard     — Countdown + "I'm alive" button
  ├ /heir/[addr]   — Heir's view: pending vs delivered, with hash-verified note
  └ /demo          — 60-second judge walkthrough
                ▼ wagmi / viem
Base Sepolia
  └ KeeperSakeVault.sol         ← stores wills + lastHeartbeat (read by KeeperHub)
  USDC (Circle official)        ← 0x036CbD53842c5426634e7929541eC2318f3dCF7e
                ▲
                │ web3/read-contract → condition → web3/write-contract
KeeperHub workflow (created via `ai_generate_workflow` MCP tool)
  Trigger: schedule (60s in demo, 1d in prod)
  Steps:
    1. read isExpired(USER)
    2. condition: == true
    3. write execute(USER)
    4. notify heir (SendGrid / Discord)
```

## Why KeeperHub

This project exists to demonstrate **the role KeeperHub fills in the agent stack**: the boring, reliable execution layer that AI agents desperately need but don't want to build.

The contract is fully permissionless — anyone can call `execute()` once a will is past timeout. KeeperHub is what makes that "anyone" actually happen, on time, with retries and gas estimation, **without anyone running a server**. Your heir doesn't need to know cron exists.

## Local setup

### 1. Deploy contracts

```bash
cd contracts
bun install
cp .env.example .env       # set PRIVATE_KEY (Base Sepolia funded wallet)
bun run test               # 8 tests pass
bun run deploy:baseSepolia
# note the printed VAULT_ADDRESS
```

### 2. Wire the frontend

Edit `frontend/lib/contracts.ts` — paste the new `VAULT_ADDRESS` (the `TOKEN_ADDRESS`
already points to Circle's official Base Sepolia USDC).

```bash
cd frontend
bun install
cp .env.example .env.local  # WalletConnect projectId from cloud.walletconnect.com
bun run dev
# http://localhost:3000
```

### 3. Set up the KeeperHub workflow

See [`docs/keeperhub-workflow.md`](./docs/keeperhub-workflow.md) for the natural-language
prompt to give Claude (with the KeeperHub MCP server connected) to generate the workflow
automatically.

## 60-second demo

1. Connect a wallet on Base Sepolia (top up ETH via [Coinbase faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet); USDC via [Circle faucet](https://faucet.circle.com/))
2. `/setup` → fill heir, amount `1` USDC, note, timeout **60s** → Approve → Commit
3. `/dashboard` → watch the countdown. **Don't click "I'm alive."**
4. At 0s the KeeperHub workflow fires within ~60s → `KeeperSakeDelivered` event emitted
5. `/heir/<your-address>` → final words readable, hash verified

## Testnet resources

- **ETH Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **USDC Faucet**: https://faucet.circle.com/ (pick Base Sepolia)
- **Block Explorer**: https://sepolia.basescan.org
- **USDC contract**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Submission deliverables

- ✅ Public GitHub repo
- ✅ Deployed contracts on Base Sepolia
- ✅ KeeperHub workflow definition + setup prompt
- ✅ `FEEDBACK.md` (Builder Feedback Bounty)
- ⏳ Demo video (3 min)

## License

MIT
