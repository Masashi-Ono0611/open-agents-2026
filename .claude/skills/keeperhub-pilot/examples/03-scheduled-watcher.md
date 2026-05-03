# Example 03 — Scheduled watcher (the KeeperSake pattern)

A workflow that runs on a schedule, reads contract state, and conditionally writes. This is the canonical KeeperHub pattern and the one `app/keepersake/` is built around.

## User prompt

> Every 30 seconds, check `isExpired(0x08D811A358850892029251CcC8a565a32fd2dCB8)` on `0x3A22bD29499702bEbc4225BfcDEAaE5DD8ae8743` (Base Sepolia). If true, call `execute(0x08D8…dCB8)` on the same contract using the agentic wallet. Stop when delivered.

## Generated workflow shape

```
[Schedule trigger 30s]
        ↓
[web3/read-contract: isExpired(USER)]
        ↓
[Condition: result == true]
        ↓ true
[web3/write-contract: execute(USER)]
```

## Skill behaviour for non-Manual triggers

- Skill creates the workflow with `enabled: true` (so the Schedule trigger starts firing immediately).
- Skill **does not** call `execute_workflow` — schedule triggers fire themselves.
- Skill returns `{ workflow_id, workflow_url, status: "watching" }` so the caller knows where to look:

```json
{
  "workflow_id": "abc123…",
  "workflow_url": "https://app.keeperhub.com/workflows/abc123…",
  "status": "watching",
  "schedule": "*/30 * * * * *",
  "agentic_wallet": "0x8F31fF5eaae3A1036839c503248e9f42479C81FD"
}
```

## Why surface this separately from Examples 01 & 02

The skill's behaviour differs by trigger type. This example documents the difference so the caller knows to expect "watching" rather than "tx in 10s" for non-Manual triggers.

## Cross-reference

- `app/keepersake/contracts/contracts/KeeperSakeVault.sol` — the contract this watches
- `app/keepersake/docs/keeperhub-workflow.md` — the pre-recorded prompt template
- `app/keepersake/FEEDBACK.md` — friction points encountered building this exact pattern (informs the skill's pitfall list)
