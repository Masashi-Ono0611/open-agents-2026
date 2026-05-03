# KeeperHub workflow setup

This is the workflow that polls each will's `isExpired(user)` and, when true, calls `execute(user)` to deliver the KeeperSake to the heir.

## Option A — generate it from natural language (recommended for the demo)

1. In Claude Code, connect the KeeperHub MCP server:

   ```bash
   claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp
   ```

   Authenticate via the browser OAuth flow.

2. Paste this prompt to Claude:

   ```
   Create a KeeperHub workflow on Base Sepolia (chainId 84532) that:

   1. Triggers every 1 minute (schedule trigger).
   2. For each user address in the variable USERS_TO_WATCH (a comma-
      separated list), reads `isExpired(address)` from the KeeperSakeVault
      contract at <VAULT_ADDRESS>.
   3. If isExpired returns true, calls `execute(address)` on the same
      contract using my agentic wallet.
   4. After a successful execution, sends an email via SendGrid to the
      heir address (look it up from the vault's `wills(address)` view —
      the heir field is the first element).

   The contract ABI for the relevant functions is:
     function isExpired(address user) external view returns (bool)
     function execute(address user) external
     function wills(address user) external view returns (
       address heir, address token, uint256 amount, bytes32 willNoteHash,
       uint64 timeout, uint64 lastHeartbeat, bool delivered
     )

   Name the workflow "KeeperSake Watcher".
   ```

3. Claude will call `ai_generate_workflow`, return a workflow ID, and the workflow goes live immediately.

## Option B — build it manually in app.keeperhub.com

If you'd rather click through the workflow builder:

| Node | Type | Config |
|------|------|--------|
| 1 | Schedule trigger | every 60 seconds |
| 2 | For each | iterate `USERS_TO_WATCH` array |
| 3 | web3/read-contract | network=Base Sepolia, address=`<VAULT_ADDRESS>`, function=`isExpired`, args=[`{{@2:item}}`] |
| 4 | Condition | branch on `{{@3.result}} == true` |
| 5 | web3/write-contract | (true branch) function=`execute`, args=[`{{@2:item}}`], walletId=`<your KeeperHub agentic wallet ID>` |
| 6 | web3/read-contract | function=`wills`, args=[`{{@2:item}}`], extract `heir` field |
| 7 | SendGrid send-email | to=`{{@6.heir}}`, subject="A KeeperSake addressed to you has been delivered", body="Visit /heir/{{@2:item}} to read the final words." |

## Inputs needed

- `<VAULT_ADDRESS>` — the deployed `KeeperSakeVault` contract address
- A KeeperHub agentic wallet, funded with Base Sepolia ETH (so it can pay gas for `execute()`)
- (Optional) SendGrid integration configured under KeeperHub Settings → Integrations

## Why this design

- **`execute()` is permissionless**: even if KeeperHub goes down, the contract is still callable by anyone — the heir, an MEV searcher, a friend. KeeperHub is a convenience, not a trust assumption.
- **No backend**: KeeperHub reads the heartbeat directly from the chain; we don't need a server with a secret.
- **AI-generated**: the workflow is born from a single English prompt — that's the whole pitch of `ai_generate_workflow`.
