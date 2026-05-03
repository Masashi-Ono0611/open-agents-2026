# Example 01 — Send USDC

The shortest possible end-to-end use of the skill.

## User prompt

> Send 0.001 USDC on Base Sepolia to 0x08D811A358850892029251CcC8a565a32fd2dCB8 via KeeperHub.

## What the skill does

### Step 1 — generate

```
mcp__keeperhub__ai_generate_workflow(prompt: <above>)
```

Returns a stream of operations: `setName`, `addNode` (Manual trigger), `addNode` (web3 transfer), `addEdge`.

### Step 2 — sanity-fix the auto-generated config

The AI generator commonly produces:

```jsonc
{
  "actionType": "Transfer ERC20 Token",   // WRONG
  "network": "Base Sepolia (chainId 84532)", // WRONG
  "tokenConfig": "0x036CbD5...",           // WRONG (raw address)
  // missing integrationId
}
```

The skill rewrites it to the working form before persisting:

```jsonc
{
  "actionType": "web3/transfer-token",
  "network": "84532",
  "tokenConfig": "{\"mode\":\"custom\",\"customToken\":{\"address\":\"0x036CbD53842c5426634e7929541eC2318f3dCF7e\",\"symbol\":\"USDC\"}}",
  "integrationId": "<id from list_integrations>",
  "amount": "{{@trigger-manual:Manual Trigger.data.recipient_amount}}",
  "recipientAddress": "{{@trigger-manual:Manual Trigger.data.recipient_address}}",
  "gasLimitMultiplier": "1.2"
}
```

### Step 3 — persist + fire

```
create_workflow(name, nodes, edges, enabled: true)
  → workflow.id
execute_workflow(workflow.id, { recipient_address, recipient_amount })
  → execution.id (status: "running")
```

### Step 4 — poll

```
get_execution_status(execution.id)  // every 2s
```

When it returns `status: "success"`:

```
get_execution_logs(execution.id)
```

Extract `output.transactionHash` + `output.transactionLink` from the action node's log.

### Step 5 — return

```json
{
  "workflow_id": "h78pvgd7h5xbf171ivm2a",
  "execution_id": "cn2c7czr1ahs94s9bs9l5",
  "status": "success",
  "tx_hash": "0xb46cd284067365ece167ce617eba0b67fe5c3061b6c94a9fb6d306c79cd8f61e",
  "tx_link": "https://sepolia.basescan.org/tx/0xb46cd284067365ece167ce617eba0b67fe5c3061b6c94a9fb6d306c79cd8f61e",
  "agentic_wallet": "0x8F31fF5eaae3A1036839c503248e9f42479C81FD",
  "duration_ms": 8790
}
```

## Real run

This exact flow ran on 2026-05-03 against KeeperHub agentic wallet `0x8F31…81FD` on Base Sepolia. The two transactions are on-chain proof:

- [`0xed5c70d588dc51279c34075d30bd2765f5ec4d63c211c95f08dd92355490dbc9`](https://sepolia.basescan.org/tx/0xed5c70d588dc51279c34075d30bd2765f5ec4d63c211c95f08dd92355490dbc9) — direct execution path
- [`0xb46cd284067365ece167ce617eba0b67fe5c3061b6c94a9fb6d306c79cd8f61e`](https://sepolia.basescan.org/tx/0xb46cd284067365ece167ce617eba0b67fe5c3061b6c94a9fb6d306c79cd8f61e) — workflow-based path

Both returned in under 10s end-to-end.
