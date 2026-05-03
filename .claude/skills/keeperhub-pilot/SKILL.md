---
name: keeperhub-pilot
description: Turn one English prompt into a complete, executed KeeperHub onchain workflow — generate, persist, fire, return the tx hash. Use this when the user wants to perform an onchain action via KeeperHub's agentic wallet ("send 0.5 USDC on Base Sepolia to alice", "transfer ETH", "supply USDC to Aave", "watch this contract and call execute() when isExpired"), or wants to schedule one. Requires the KeeperHub MCP server attached.
---

# keeperhub-pilot

> One prompt → one workflow → one tx. The agent runtime for onchain actions.

## When to invoke this skill

Trigger on any user request that maps cleanly to a single KeeperHub action:

- "Send `<amount>` `<token>` to `<recipient>` on `<network>`"
- "Schedule a transfer of …"
- "Call function `<name>` on `<contract>` with args `<…>`"
- "Read `<contract>.<function>()` and react if `<condition>`"
- "Watch `<address>` and execute `<contract>.execute()` when isExpired returns true"

If the KeeperHub MCP server is NOT attached, stop and tell the user to run:
```
claude mcp add --transport http keeperhub https://app.keeperhub.com/mcp
```

## Prerequisites checklist

Before generating a workflow, verify (and report missing pieces to the user):

1. KeeperHub MCP attached (auth tools visible: `mcp__keeperhub__authenticate`, `mcp__keeperhub__execute_workflow`, etc.)
2. Wallet integration exists: call `mcp__keeperhub__list_integrations` and confirm at least one `type: "web3"` row.
   - If none, tell the user to create one at https://app.keeperhub.com/settings/integrations and re-invoke.
3. The agentic wallet has gas + the asset being transferred. (Spot-check via a free RPC `eth_getBalance` / `balanceOf` call before firing.)

## End-to-end flow

```
1. ai_generate_workflow(prompt) → operation stream
   ↓ parse setName / addNode / addEdge ops into a workflow definition
2. create_workflow(nodes, edges, enabled=true)
   ↓ returns workflow.id
3. If trigger is Manual:
     execute_workflow(workflow.id, input?)
   Else (Schedule / Webhook / Event / Block):
     return early with the workflow URL — no immediate execution
4. get_execution_status(execution.id)  — poll every 2s, give up after 60s
5. get_execution_logs(execution.id) — extract tx hash + Block-explorer link
6. Return concise summary: { workflow_id, execution_id, tx_hash, link, status }
```

## Hard-won pitfalls (verified through testing)

These are not in KeeperHub's published docs as of 2026-05. Apply them when calling `create_workflow`/`update_workflow`:

| Pitfall | Wrong | Right |
|---|---|---|
| `network` field on web3 actions | `"Base Sepolia"`, `"base-sepolia"`, `"84532"` (string but quoted differently) | **chain-id string**: `"84532"` |
| `actionType` for ERC20 transfer | `"Transfer ERC20 Token"` | `"web3/transfer-token"` |
| `tokenConfig` shape | `{address, symbol, decimals}` flat | `"{\"mode\":\"custom\",\"customToken\":{\"address\":\"0x...\",\"symbol\":\"USDC\"}}"` (JSON **string**) |
| Wallet writes need credentials | omit `integrationId` | `integrationId: <id from list_integrations>` |
| Template syntax for trigger inputs | `{{trigger.recipient}}` or `{{recipient}}` | `{{@<trigger-node-id>:<Trigger Label>.data.<field>}}` |
| Workflow `enabled` defaults to false | leave unset | pass `enabled: true` on create |

If the AI-generated workflow fails to execute the action node (only `trigger-manual` shows in the trace), it's almost certainly one of the above. Inspect the failed node's `config`, fix it via `update_workflow`, and re-fire.

## Output contract

Always return a single fenced JSON block at the end of your response:

```json
{
  "workflow_id": "h78pvgd7h5xbf171ivm2a",
  "execution_id": "cn2c7czr1ahs94s9bs9l5",
  "status": "success",
  "tx_hash": "0xb46cd28...",
  "tx_link": "https://sepolia.basescan.org/tx/0xb46cd28...",
  "agentic_wallet": "0x8F31fF5eaae3A1036839c503248e9f42479C81FD",
  "duration_ms": 8790
}
```

For non-Manual triggers (Schedule/Webhook/etc.), omit `execution_id`/`tx_hash` and add `workflow_url`.

## Examples

See `examples/` next to this skill:

- `examples/01-send-usdc.md` — one-line prompt → ERC-20 transfer → tx hash
- `examples/02-call-contract.md` — call an arbitrary contract write function
- `examples/03-scheduled-watcher.md` — schedule trigger that polls a view function and acts on it (the canonical KeeperSake pattern)

## Why this skill exists

KeeperHub's MCP surface is excellent at the primitive level (`ai_generate_workflow`, `create_workflow`, `execute_workflow`) but the friction is in the gaps between calls — picking the right `actionType`, formatting `tokenConfig`, wiring trigger inputs through templates, knowing which fields default-fail. This skill encodes those gaps as one workflow so a developer (or another agent) can invoke "send 0.5 USDC to alice" and get a tx hash back, without re-discovering the gotchas.

It's the answer to F8 in the project's `app/keepersake/FEEDBACK.md`: *"How do I prove KeeperHub is alive from outside its own UI?"* — by making it the runtime for *all* onchain actions an agent might need to take, and treating workflows as ephemeral primitives rather than persistent infrastructure.
